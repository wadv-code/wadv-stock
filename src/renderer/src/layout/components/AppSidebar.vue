<script setup lang="ts">
import { Command, Frame, PieChart, Map as SetMap } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import NavMain from './NavMain.vue';
import NavUser from './NavUser.vue';
import NavProjects from './NavProjects.vue';
import TeamSwitcher from './TeamSwitcher.vue';
import { useRouter } from 'vue-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProps,
  SidebarRail
} from '@renderer/components/ui/sidebar';

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon'
});

const router = useRouter();

// This is sample data.
const data = ref({
  teams: [
    {
      name: 'page.home.evil',
      logo: Command,
      plan: 'Free'
    }
    // {
    //   name: 'page.home.welfare',
    //   logo: GalleryVerticalEnd,
    //   plan: 'Enterprise'
    // },
    // {
    //   name: 'page.home.acme',
    //   logo: AudioWaveform,
    //   plan: 'Startup'
    // }
  ],
  navMain: [],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart
    },
    {
      name: 'Travel',
      url: '#',
      icon: SetMap
    }
  ]
});
// console.log(router.getRoutes());

onMounted(() => {
  const routes = router.getRoutes().filter((f) => !!f.meta.icon);
  // @ts-ignore
  data.value.navMain = routes.map((f) => ({
    title: f.meta.title,
    url: f.path,
    icon: f.meta.icon
  }));
});
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
