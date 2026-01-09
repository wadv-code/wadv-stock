import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

export function useAGridModule() {
  ModuleRegistry.registerModules([AllCommunityModule]);
}
