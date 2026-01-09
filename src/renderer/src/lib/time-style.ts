import {
  CandleTooltipRectPosition,
  CandleType,
  LineType,
  PolygonType,
  TooltipShowRule,
  TooltipShowType,
  type Styles,
  type DeepPartial
} from 'klinecharts';

export enum CandleColorCompareRule {
  CurrentOpen = 'current_open',
  PreviousClose = 'previous_close'
}

// 深色主题
export const darkStyles: DeepPartial<Styles> = {
  grid: {
    show: true,
    horizontal: {
      show: true,
      size: 1,
      color: '#292929',
      style: LineType.Dashed,
      dashedValue: [2, 2]
    },
    vertical: { show: true, size: 1, color: '#292929', style: LineType.Dashed, dashedValue: [2, 2] }
  },
  candle: {
    type: CandleType.CandleStroke,
    bar: {
      compareRule: CandleColorCompareRule.CurrentOpen,
      upColor: '#F92855',
      downColor: '#2DC08E',
      noChangeColor: '#76808F',
      upBorderColor: '#F92855',
      downBorderColor: '#2DC08E',
      noChangeBorderColor: '#76808F',
      upWickColor: '#F92855',
      downWickColor: '#2DC08E',
      noChangeWickColor: '#76808F'
    },
    area: {
      lineSize: 2,
      lineColor: '#1677FF',
      smooth: false,
      value: 'close',
      backgroundColor: [
        { offset: 0, color: 'rgba(22, 119, 255, 0.01)' },
        { offset: 1, color: 'rgba(22, 119, 255, 0.2)' }
      ],
      point: {
        show: true,
        color: '#1677FF',
        radius: 4,
        rippleColor: 'rgba(22, 119, 255, 0.3)',
        rippleRadius: 8,
        animation: true,
        animationDuration: 1000
      }
    },
    priceMark: {
      show: true,
      high: {
        show: true,
        color: '#929AA5',
        textOffset: 5,
        textSize: 10,
        textFamily: 'Helvetica Neue',
        textWeight: 'normal'
      },
      low: {
        show: true,
        color: '#929AA5',
        textOffset: 5,
        textSize: 10,
        textFamily: 'Helvetica Neue',
        textWeight: 'normal'
      },
      last: {
        show: true,
        compareRule: CandleColorCompareRule.CurrentOpen,
        upColor: '#F92855',
        downColor: '#2DC08E',
        noChangeColor: '#76808F',
        line: { show: true, style: LineType.Dashed, dashedValue: [4, 4], size: 1 },
        text: {
          show: true,
          style: PolygonType.Fill,
          size: 12,
          paddingLeft: 4,
          paddingTop: 4,
          paddingRight: 4,
          paddingBottom: 4,
          borderColor: 'transparent',
          borderStyle: LineType.Solid,
          borderSize: 0,
          borderDashedValue: [2, 2],
          color: '#FFFFFF',
          family: 'Helvetica Neue',
          weight: 'normal',
          borderRadius: 2
        }
      }
    },
    tooltip: {
      offsetLeft: 4,
      offsetTop: 6,
      offsetRight: 4,
      offsetBottom: 6,
      showRule: TooltipShowRule.Always,
      showType: TooltipShowType.Standard,
      custom: [],
      defaultValue: 'n/a',
      rect: {
        position: CandleTooltipRectPosition.Fixed,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
        paddingBottom: 4,
        offsetLeft: 4,
        offsetTop: 4,
        offsetRight: 4,
        offsetBottom: 4,
        borderRadius: 4,
        borderSize: 1,
        borderColor: 'rgba(10, 10, 10, .6)',
        color: 'rgba(10, 10, 10, .6)'
      },
      text: {
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        color: '#929AA5',
        marginLeft: 5,
        marginTop: 1,
        marginRight: 5,
        marginBottom: 1
      },
      features: []
    }
  },
  indicator: {
    ohlc: {
      compareRule: CandleColorCompareRule.CurrentOpen,
      upColor: 'rgba(249, 40, 85, 0.7)',
      downColor: 'rgba(45, 192, 142, 0.7)',
      noChangeColor: '#76808F'
    },
    bars: [
      {
        style: PolygonType.Fill,
        borderStyle: LineType.Solid,
        borderSize: 1,
        borderDashedValue: [2, 2],
        upColor: 'rgba(249, 40, 85, 0.7)',
        downColor: 'rgba(45, 192, 142, 0.7)',
        noChangeColor: '#76808F'
      }
    ],
    lines: [
      { style: LineType.Solid, smooth: false, size: 1, dashedValue: [2, 2], color: '#FF9600' },
      { style: LineType.Solid, smooth: false, size: 1, dashedValue: [2, 2], color: '#935EBD' },
      { style: LineType.Solid, smooth: false, size: 1, dashedValue: [2, 2], color: '#1677FF' },
      { style: LineType.Solid, smooth: false, size: 1, dashedValue: [2, 2], color: '#E11D74' },
      { style: LineType.Solid, smooth: false, size: 1, dashedValue: [2, 2], color: '#01C5C4' }
    ],
    circles: [
      {
        style: PolygonType.Fill,
        borderStyle: LineType.Solid,
        borderSize: 1,
        borderDashedValue: [2, 2],
        upColor: 'rgba(249, 40, 85, 0.7)',
        downColor: 'rgba(45, 192, 142, 0.7)',
        noChangeColor: '#76808F'
      }
    ],
    lastValueMark: {
      show: false,
      text: {
        show: false,
        style: PolygonType.Fill,
        color: '#FFFFFF',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        borderStyle: LineType.Solid,
        borderColor: 'transparent',
        borderSize: 0,
        borderDashedValue: [2, 2],
        paddingLeft: 4,
        paddingTop: 4,
        paddingRight: 4,
        paddingBottom: 4,
        borderRadius: 2
      }
    },
    tooltip: {
      offsetLeft: 4,
      offsetTop: 6,
      offsetRight: 4,
      offsetBottom: 6,
      showRule: TooltipShowRule.Always,
      showType: TooltipShowType.Standard,
      showName: true,
      showParams: true,
      defaultValue: 'n/a',
      text: {
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        color: '#929AA5',
        marginLeft: 5,
        marginTop: 1,
        marginRight: 5,
        marginBottom: 1
      },
      features: []
    }
  },
  xAxis: {
    show: true,
    size: 'auto',
    axisLine: { show: true, color: '#333333', size: 1 },
    tickText: {
      show: true,
      color: '#929AA5',
      size: 12,
      family: 'Helvetica Neue',
      weight: 'normal',
      marginStart: 4,
      marginEnd: 6
    },
    tickLine: { show: true, size: 1, length: 3, color: '#333333' }
  },
  yAxis: {
    show: true,
    size: 'auto',
    axisLine: { show: true, color: '#333333', size: 1 },
    tickText: {
      show: true,
      color: '#929AA5',
      size: 12,
      family: 'Helvetica Neue',
      weight: 'normal',
      marginStart: 4,
      marginEnd: 6
    },
    tickLine: { show: true, size: 1, length: 3, color: '#333333' }
  },
  separator: {
    size: 1,
    color: '#333333',
    fill: true,
    activeBackgroundColor: 'rgba(22, 119, 255, 0.08)'
  },
  crosshair: {
    show: true,
    horizontal: {
      show: true,
      line: { show: true, style: LineType.Dashed, dashedValue: [4, 2], size: 1, color: '#929AA5' },
      text: {
        show: true,
        style: PolygonType.Fill,
        color: '#FFFFFF',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        borderStyle: LineType.Solid,
        borderDashedValue: [2, 2],
        borderSize: 1,
        borderColor: '#373a40',
        borderRadius: 2,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: '#373a40'
      }
    },
    vertical: {
      show: true,
      line: { show: true, style: LineType.Dashed, dashedValue: [4, 2], size: 1, color: '#929AA5' },
      text: {
        show: true,
        style: PolygonType.Fill,
        color: '#FFFFFF',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        borderStyle: LineType.Solid,
        borderDashedValue: [2, 2],
        borderSize: 1,
        borderColor: '#373a40',
        borderRadius: 2,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: '#373a40'
      }
    }
  },
  overlay: {
    point: {
      color: '#1677FF',
      borderColor: 'rgba(22, 119, 255, 0.35)',
      borderSize: 1,
      radius: 5,
      activeColor: '#1677FF',
      activeBorderColor: 'rgba(22, 119, 255, 0.35)',
      activeBorderSize: 3,
      activeRadius: 5
    },
    line: { style: LineType.Solid, smooth: false, color: '#1677FF', size: 1, dashedValue: [2, 2] },
    rect: {
      style: PolygonType.Fill,
      color: 'rgba(22, 119, 255, 0.25)',
      borderColor: '#1677FF',
      borderSize: 1,
      borderRadius: 0,
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2]
    },
    polygon: {
      style: PolygonType.Fill,
      color: '#1677FF',
      borderColor: '#1677FF',
      borderSize: 1,
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2]
    },
    circle: {
      style: PolygonType.Fill,
      color: 'rgba(22, 119, 255, 0.25)',
      borderColor: '#1677FF',
      borderSize: 1,
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2]
    },
    arc: { style: LineType.Solid, color: '#1677FF', size: 1, dashedValue: [2, 2] },
    text: {
      style: PolygonType.Fill,
      color: '#FFFFFF',
      size: 12,
      family: 'Helvetica Neue',
      weight: 'normal',
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2],
      borderSize: 1,
      borderRadius: 2,
      borderColor: '#1677FF',
      paddingLeft: 4,
      paddingRight: 4,
      paddingTop: 4,
      paddingBottom: 4,
      backgroundColor: '#1677FF'
    }
  }
};

// 浅色主题
export const lightStyles: DeepPartial<Styles> = {
  grid: {
    show: true,
    horizontal: {
      show: true,
      size: 1,
      color: '#EDEDED',
      style: LineType.Dashed,
      dashedValue: [2, 2]
    },
    vertical: { show: true, size: 1, color: '#EDEDED', style: LineType.Dashed, dashedValue: [2, 2] }
  },
  candle: {
    type: CandleType.CandleSolid,
    bar: {
      compareRule: CandleColorCompareRule.CurrentOpen,
      upColor: '#F92855',
      downColor: '#2DC08E',
      noChangeColor: '#76808F',
      upBorderColor: '#F92855',
      downBorderColor: '#2DC08E',
      noChangeBorderColor: '#76808F',
      upWickColor: '#F92855',
      downWickColor: '#2DC08E',
      noChangeWickColor: '#76808F'
    },
    area: {
      lineSize: 2,
      lineColor: '#1677FF',
      smooth: false,
      value: 'close',
      backgroundColor: [
        { offset: 0, color: 'rgba(22, 119, 255, 0.01)' },
        { offset: 1, color: 'rgba(22, 119, 255, 0.2)' }
      ],
      point: {
        show: true,
        color: '#1677FF',
        radius: 4,
        rippleColor: 'rgba(22, 119, 255, 0.3)',
        rippleRadius: 8,
        animation: true,
        animationDuration: 1000
      }
    },
    priceMark: {
      show: true,
      high: {
        show: true,
        color: '#76808F',
        textOffset: 5,
        textSize: 10,
        textFamily: 'Helvetica Neue',
        textWeight: 'normal'
      },
      low: {
        show: true,
        color: '#76808F',
        textOffset: 5,
        textSize: 10,
        textFamily: 'Helvetica Neue',
        textWeight: 'normal'
      },
      last: {
        show: true,
        compareRule: CandleColorCompareRule.CurrentOpen,
        upColor: '#F92855',
        downColor: '#2DC08E',
        noChangeColor: '#76808F',
        line: { show: true, style: LineType.Dashed, dashedValue: [4, 4], size: 1 },
        text: {
          show: true,
          style: PolygonType.Fill,
          size: 12,
          paddingLeft: 4,
          paddingTop: 4,
          paddingRight: 4,
          paddingBottom: 4,
          borderColor: 'transparent',
          borderStyle: LineType.Solid,
          borderSize: 0,
          borderDashedValue: [2, 2],
          color: '#FFFFFF',
          family: 'Helvetica Neue',
          weight: 'normal',
          borderRadius: 2
        }
      }
    },
    tooltip: {
      offsetLeft: 4,
      offsetTop: 6,
      offsetRight: 4,
      offsetBottom: 6,
      showRule: TooltipShowRule.Always,
      showType: TooltipShowType.Standard,
      custom: [],
      defaultValue: 'n/a',
      rect: {
        position: CandleTooltipRectPosition.Fixed,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
        paddingBottom: 4,
        offsetLeft: 4,
        offsetTop: 4,
        offsetRight: 4,
        offsetBottom: 4,
        borderRadius: 4,
        borderSize: 1,
        borderColor: '#F2F3F5',
        color: '#FEFEFE'
      },
      text: {
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        color: '#76808F',
        marginLeft: 5,
        marginTop: 1,
        marginRight: 5,
        marginBottom: 1
      },
      features: []
    }
  },
  indicator: {
    ohlc: {
      compareRule: CandleColorCompareRule.CurrentOpen,
      upColor: 'rgba(249, 40, 85, 0.7)',
      downColor: 'rgba(45, 192, 142, 0.7)',
      noChangeColor: '#76808F'
    },
    bars: [
      {
        style: PolygonType.Fill,
        borderStyle: LineType.Solid,
        borderSize: 1,
        borderDashedValue: [2, 2],
        upColor: 'rgba(249, 40, 85, 0.7)',
        downColor: 'rgba(45, 192, 142, 0.7)',
        noChangeColor: '#76808F'
      }
    ],
    lines: [
      { style: LineType.Solid, smooth: false, size: 1, dashedValue: [2, 2], color: '#FF9600' },
      { style: LineType.Solid, smooth: false, size: 1, dashedValue: [2, 2], color: '#935EBD' },
      { style: LineType.Solid, smooth: false, size: 1, dashedValue: [2, 2], color: '#1677FF' },
      { style: LineType.Solid, smooth: false, size: 1, dashedValue: [2, 2], color: '#E11D74' },
      { style: LineType.Solid, smooth: false, size: 1, dashedValue: [2, 2], color: '#01C5C4' }
    ],
    circles: [
      {
        style: PolygonType.Fill,
        borderStyle: LineType.Solid,
        borderSize: 1,
        borderDashedValue: [2, 2],
        upColor: 'rgba(249, 40, 85, 0.7)',
        downColor: 'rgba(45, 192, 142, 0.7)',
        noChangeColor: '#76808F'
      }
    ],
    lastValueMark: {
      show: false,
      text: {
        show: false,
        style: PolygonType.Fill,
        color: '#FFFFFF',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        borderStyle: LineType.Solid,
        borderColor: 'transparent',
        borderSize: 0,
        borderDashedValue: [2, 2],
        paddingLeft: 4,
        paddingTop: 4,
        paddingRight: 4,
        paddingBottom: 4,
        borderRadius: 2
      }
    },
    tooltip: {
      offsetLeft: 4,
      offsetTop: 6,
      offsetRight: 4,
      offsetBottom: 6,
      showRule: TooltipShowRule.Always,
      showType: TooltipShowType.Standard,
      showName: true,
      showParams: true,
      defaultValue: 'n/a',
      text: {
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        color: '#76808F',
        marginLeft: 5,
        marginTop: 1,
        marginRight: 5,
        marginBottom: 1
      },
      features: []
    }
  },
  xAxis: {
    show: true,
    size: 'auto',
    axisLine: { show: true, color: '#DDDDDD', size: 1 },
    tickText: {
      show: true,
      color: '#76808F',
      size: 12,
      family: 'Helvetica Neue',
      weight: 'normal',
      marginStart: 4,
      marginEnd: 6
    },
    tickLine: { show: true, size: 1, length: 3, color: '#DDDDDD' }
  },
  yAxis: {
    show: true,
    size: 'auto',
    axisLine: { show: true, color: '#DDDDDD', size: 1 },
    tickText: {
      show: true,
      color: '#76808F',
      size: 12,
      family: 'Helvetica Neue',
      weight: 'normal',
      marginStart: 4,
      marginEnd: 6
    },
    tickLine: { show: true, size: 1, length: 3, color: '#DDDDDD' }
  },
  separator: {
    size: 1,
    color: '#DDDDDD',
    fill: true,
    activeBackgroundColor: 'rgba(22, 119, 255, 0.08)'
  },
  crosshair: {
    show: true,
    horizontal: {
      show: true,
      line: { show: true, style: LineType.Dashed, dashedValue: [4, 2], size: 1, color: '#76808F' },
      text: {
        show: true,
        style: PolygonType.Fill,
        color: '#FFFFFF',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        borderStyle: LineType.Solid,
        borderDashedValue: [2, 2],
        borderSize: 1,
        borderColor: '#686D76',
        borderRadius: 2,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: '#686D76'
      }
    },
    vertical: {
      show: true,
      line: { show: true, style: LineType.Dashed, dashedValue: [4, 2], size: 1, color: '#76808F' },
      text: {
        show: true,
        style: PolygonType.Fill,
        color: '#FFFFFF',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        borderStyle: LineType.Solid,
        borderDashedValue: [2, 2],
        borderSize: 1,
        borderColor: '#686D76',
        borderRadius: 2,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: '#686D76'
      }
    }
  },
  overlay: {
    point: {
      color: '#1677FF',
      borderColor: 'rgba(22, 119, 255, 0.35)',
      borderSize: 1,
      radius: 5,
      activeColor: '#1677FF',
      activeBorderColor: 'rgba(22, 119, 255, 0.35)',
      activeBorderSize: 3,
      activeRadius: 5
    },
    line: { style: LineType.Solid, smooth: false, color: '#1677FF', size: 1, dashedValue: [2, 2] },
    rect: {
      style: PolygonType.Fill,
      color: 'rgba(22, 119, 255, 0.25)',
      borderColor: '#1677FF',
      borderSize: 1,
      borderRadius: 0,
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2]
    },
    polygon: {
      style: PolygonType.Fill,
      color: '#1677FF',
      borderColor: '#1677FF',
      borderSize: 1,
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2]
    },
    circle: {
      style: PolygonType.Fill,
      color: 'rgba(22, 119, 255, 0.25)',
      borderColor: '#1677FF',
      borderSize: 1,
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2]
    },
    arc: { style: LineType.Solid, color: '#1677FF', size: 1, dashedValue: [2, 2] },
    text: {
      style: PolygonType.Fill,
      color: '#FFFFFF',
      size: 12,
      family: 'Helvetica Neue',
      weight: 'normal',
      borderStyle: LineType.Solid,
      borderDashedValue: [2, 2],
      borderSize: 1,
      borderRadius: 2,
      borderColor: '#1677FF',
      paddingLeft: 4,
      paddingRight: 4,
      paddingTop: 4,
      paddingBottom: 4,
      backgroundColor: '#1677FF'
    }
  }
};
