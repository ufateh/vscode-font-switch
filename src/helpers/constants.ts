export interface IStatusBarItem {
  text: string;
  tooltip: string;
  command: string;
}

export const strings = {
  editorFontFamily: 'editor.fontFamily',
  quickPickPlaceholder: 'Select editor font:',
  current: '(current)'
};

export const cmds = {
  setFont: 'editorFont.set'
};

export const tooltips = {
  set: 'Set Editor Font'
};
