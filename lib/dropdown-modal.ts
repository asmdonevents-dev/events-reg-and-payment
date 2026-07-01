/** Run after a DropdownMenu closes so a Dialog can open without focus-trap conflicts. */
export function runAfterDropdownClose(callback: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}
