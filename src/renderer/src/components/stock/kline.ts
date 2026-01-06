import { useDark } from '@vueuse/core';
import {
  IndicatorSeries,
  registerFigure,
  registerIndicator,
  registerOverlay,
  type KLineData,
  type RectAttrs,
  type SeparatorStyle
} from 'klinecharts';
import { type Ref } from 'vue';

/**
 * 注册K线图
 * @param dark 是否为暗黑模式
 */
export function registerKLine(unlimit_shares: Ref<number>) {
  const isDark = useDark();
  // 多空线2条
  registerIndicator({
    name: 'DKX',
    shortName: 'DKX',
    series: IndicatorSeries.Price,
    figures: [
      {
        key: 'dkx',
        title: 'DKX: ',
        type: 'line',
        styles: () => {
          return {
            color: isDark.value ? '#ffffff' : '#000000',
            gap: 1
          };
        }
      },
      {
        key: 'madkx',
        title: 'MADKX: ',
        type: 'line',
        styles: () => {
          return {
            color: isDark.value ? '#f2fa88' : '#e7000b',
            gap: 1
          };
        }
      }
    ],
    calc: (dataList: KLineData[]) => {
      return dataList;
    }
  });

  registerIndicator({
    name: 'TIME',
    shortName: '分时',
    series: IndicatorSeries.Price,
    figures: [
      {
        key: 'close',
        title: '分时: ',
        type: 'line',
        styles: () => {
          return {
            color: isDark.value ? '#ffffff' : '#e7000b',
            gap: 1
          };
        }
      },
      {
        // 新增均线配置（以均价线为例）
        key: 'avgPrice', // 均线数据的唯一标识，需和calc中返回的字段对应
        title: '均价: ',
        type: 'line', // 均线类型为线图
        styles: () => {
          return {
            color: isDark.value ? '#f2fa88' : '#0066ff', // 均线颜色（区分分时线）
            gap: 1,
            lineWidth: 1 // 可选：设置线宽
          };
        }
      }
    ],
    calc: (dataList: KLineData[]) => {
      // 计算分时均价（以成交量加权平均为例，符合常规分时均价逻辑）
      let totalVolume = 0; // 累计成交量
      let totalAmount = 0; // 累计成交额（价格*成交量）

      // 遍历K线数据，计算每根K线对应的均价
      return dataList.map((item) => {
        // 累加成交量和成交额（需确保KLineData包含volume和close字段）
        totalVolume += item.volume || 0;
        totalAmount += (item.close || 0) * (item.volume || 0);

        // 计算当前均价（避免除以0）
        const avgPrice = totalVolume > 0 ? totalAmount / totalVolume : item.close || 0;

        // 返回原数据 + 新增的均线字段（key需和figures中配置的一致）
        return {
          ...item,
          avgPrice // 均价数据
        };
      });
    }
  });

  registerIndicator({
    name: 'TIME_PRICE',
    shortName: '流通股',
    series: IndicatorSeries.Price,
    figures: [
      {
        key: 'volumePrice',
        title: 'CALC: ',
        type: 'line',
        styles: () => {
          return {
            color: isDark.value ? '#ffffff' : '#e7000b',
            gap: 1
          };
        }
      }
    ],
    calc: (dataList: KLineData[]) => {
      // 计算分时均价（以成交量加权平均为例，符合常规分时均价逻辑）
      // let totalVolume = 0; // 累计成交量
      // let totalAmount = 0; // 累计成交额（价格*成交量）

      // 遍历K线数据，计算每根K线对应的均价
      return dataList.map((item) => {
        // 累加成交量和成交额（需确保KLineData包含volume和close字段）
        // const totalVolume = item.volume || 0;
        const unlimit_value = unlimit_shares.value / 100000000;
        // totalAmount += (item.close || 0) * (item.volume || 0);
        // 计算当前均价（避免除以0）
        const volumePrice = unlimit_value * 1000;

        // 返回原数据 + 新增的均线字段（key需和figures中配置的一致）
        return {
          ...item,
          volumePrice // 均价数据
        };
      });
    }
  });

  // 钻石图
  registerFigure({
    name: 'diamond',
    draw: (ctx, attrs: RectAttrs, styles: SeparatorStyle) => {
      const { x, y, width, height } = attrs;
      const { color } = styles;
      ctx.beginPath();
      ctx.moveTo(x - width / 2, y);
      ctx.lineTo(x, y - height / 2);
      ctx.lineTo(x + width / 2, y);
      ctx.lineTo(x, y + height / 2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    },
    checkEventOn: () => false
  });

  // 钻石图标注
  registerOverlay<{ color: string }>({
    name: 'diamondAnnotation',
    createPointFigures: (data) => {
      const { coordinates, overlay } = data;
      const { extendData } = overlay || {};
      const { color = '#ffd230' } = extendData || {};
      return {
        type: 'diamond',
        attrs: {
          x: coordinates[0]?.x,
          y: coordinates[0]?.y,
          width: 6,
          height: 6
        },

        styles: { color: color || '#ffd230' }
      };
    }
  });

  // 矩形图（带边框）
  registerFigure({
    name: 'rectangle', // 矩形图唯一标识（自定义命名）
    draw: (
      ctx,
      attrs: RectAttrs,
      styles: SeparatorStyle & {
        borderColor?: string;
        borderWidth?: number;
        borderVisible?: boolean;
      }
    ) => {
      const { x, y, width, height } = attrs; // 基于中心点(x,y)的宽高
      const {
        color = '#000', // 填充色默认值
        borderColor = isDark.value ? '#fff' : '#000', // 边框颜色默认值
        borderWidth = 1, // 边框宽度默认值
        borderVisible = true // 是否显示边框默认值
      } = styles; // 扩展支持边框样式

      // 计算矩形的实际坐标（基于中心点偏移）
      const rectX = x - width / 2;
      const rectY = y - height / 2;

      ctx.beginPath();
      // 绘制矩形路径（x/y为左上角坐标，width/height为宽高）
      ctx.rect(rectX, rectY, width, height);

      // 1. 设置填充样式并填充矩形
      ctx.fillStyle = color;
      ctx.fill();

      // 2. 绘制边框（按需）
      if (borderVisible && borderWidth > 0) {
        ctx.strokeStyle = borderColor; // 边框颜色
        ctx.lineWidth = borderWidth; // 边框宽度
        // 可选：设置线条端点/拐角样式（优化视觉效果）
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(); // 执行描边绘制
      }

      ctx.closePath(); // 闭合路径（可选，增强代码规范性）
    },
    checkEventOn: () => false // 关闭事件检测（无需交互）
  });

  // 矩形图标注
  registerOverlay<KLineData>({
    name: 'rectangleAnnotation',
    createPointFigures: (data) => {
      const { coordinates, overlay } = data;
      const { extendData } = overlay || {};
      const { zhang_ting, zha_ban } = extendData || {};
      return {
        type: 'rectangle',
        attrs: {
          x: coordinates[0]?.x,
          y: coordinates[0]?.y,
          width: 10,
          height: 5
        },

        styles: { color: zhang_ting ? '#fb2c36' : zha_ban ? '#00c951' : '#99a1af' }
      };
    }
  });

  // 建仓标注-正方形
  registerFigure({
    name: 'square',
    /**
     * 绘制正方形逻辑
     * @param ctx Canvas 2D上下文
     * @param attrs 位置/尺寸属性（x/y为中心坐标，width/height取其一即可，最终取最小值保证正方形）
     * @param styles 样式属性（填充颜色）
     */
    draw: (ctx, attrs: RectAttrs, styles: SeparatorStyle) => {
      const { x, y, width, height } = attrs;
      const { color } = styles;

      // 正方形取宽高中的最小值，保证边长相等
      const sideLength = Math.min(width, height);
      // 计算正方形左上角坐标（以x/y为中心）
      const left = x - sideLength / 2;
      const top = y - sideLength / 2;

      ctx.beginPath();
      // 绘制正方形（边长统一为sideLength）
      ctx.rect(left, top, sideLength, sideLength);
      ctx.closePath();

      // 设置填充颜色并填充
      ctx.fillStyle = color;
      ctx.fill();
    },
    checkEventOn: () => false
  });

  // 建仓高低点标注
  registerOverlay<{ color: string }>({
    name: 'buildAnnotation',
    createPointFigures: (data) => {
      const { coordinates, overlay } = data;
      const { extendData } = overlay || {};
      const { color = '#99a1af' } = extendData || {};
      return {
        type: 'square',
        attrs: {
          x: coordinates[0]?.x,
          y: coordinates[0]?.y,
          width: 6,
          height: 6
        },

        styles: { color }
      };
    }
  });

  // 注册【主图叠加】的分时/自定义指标（修正版）
  registerIndicator({
    name: 'Minute',
    shortName: '分时',
    series: IndicatorSeries.Price,
    calcParams: [],
    // 核心：calc接收的是K线数据，需兼容（若用分时数据，需先替换K线数据源）
    calc: (dataList: any[]) => {
      return dataList.map((item) => ({
        price: item.price || item.close, // 兼容K线close字段（主图K线用close）
        avgPrice: item.avgPrice || (item.open + item.close) / 2 // 兜底
      }));
    }
  });

  // // 文字标注
  // registerFigure({
  //   name: 'textLabel', // 建议修改名称，便于区分
  //   draw: (
  //     ctx,
  //     attrs: {
  //       x: number;
  //       y: number;
  //       width?: number;
  //       height?: number;
  //       text?: string;
  //       fontSize?: number;
  //       fontWeight?: string;
  //     },
  //     styles: { color: string; textColor?: string }
  //   ) => {
  //     const {
  //       x,
  //       y,
  //       text = '标注', // 默认文字
  //       fontSize = 10, // 默认字体大小
  //       fontWeight = 'normal', // 默认字体粗细
  //       width = fontSize * text.length, // 自动计算宽度（可选）
  //       height = fontSize * 1.2, // 自动计算高度（可选）
  //     } = attrs;
  //     const { color = '#FF5722', textColor = '#FFFFFF' } = styles;

  //     // 1. 绘制文字背景（可选，增强可读性）
  //     ctx.beginPath();
  //     // 绘制圆角矩形背景
  //     const borderRadius = 3;
  //     const bgWidth = width;
  //     const bgHeight = height;
  //     const bgX = x - bgWidth / 2;
  //     const bgY = y - bgHeight / 2;

  //     // 绘制圆角矩形路径
  //     ctx.moveTo(bgX + borderRadius, bgY);
  //     ctx.lineTo(bgX + bgWidth - borderRadius, bgY);
  //     ctx.arcTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + borderRadius, borderRadius);
  //     ctx.lineTo(bgX + bgWidth, bgY + bgHeight - borderRadius);
  //     ctx.arcTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - borderRadius, bgY + bgHeight, borderRadius);
  //     ctx.lineTo(bgX + borderRadius, bgY + bgHeight);
  //     ctx.arcTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - borderRadius, borderRadius);
  //     ctx.lineTo(bgX, bgY + borderRadius);
  //     ctx.arcTo(bgX, bgY, bgX + borderRadius, bgY, borderRadius);
  //     ctx.closePath();

  //     ctx.fillStyle = color; // 背景色
  //     ctx.fill();

  //     // 2. 绘制文字
  //     ctx.font = `${fontWeight} ${fontSize}px Arial`;
  //     ctx.textAlign = 'center'; // 文字水平居中
  //     ctx.textBaseline = 'middle'; // 文字垂直居中
  //     ctx.fillStyle = textColor; // 文字颜色
  //     ctx.fillText(text, x, y); // 在中心点绘制文字
  //   },
  //   checkEventOn: () => false,
  // });

  // // 文字标注
  // registerOverlay<KLineData>({
  //   name: 'textLabel',
  //   createPointFigures: (data) => {
  //     const { coordinates, overlay } = data;
  //     const { extendData } = overlay || {};
  //     const { zhang_ting, zha_ban } = extendData || {};
  //     const text = zhang_ting ? '涨停' : zha_ban ? '炸板' : '';
  //     return {
  //       type: 'textLabel',
  //       attrs: {
  //         x: coordinates[0]?.x,
  //         y: coordinates[0]?.y,
  //         width: 25,
  //         height: 15,
  //         text,
  //       },

  //       styles: { color: zhang_ting ? '#fb2c36' : '#00c951' },
  //     };
  //   },
  // });
}
