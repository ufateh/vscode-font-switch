import { commands, ExtensionContext, workspace } from 'vscode';
import { cmds } from './helpers/constants';
import { openQuickPick } from './helpers/quickPickMenu';

export function setFontFamily(newFont: string) {
  const config = workspace.getConfiguration();
  const current = config.get<string>('editor.fontFamily') || '';
  const fonts = current.split(',').map(f => f.trim()).filter(f => f && f !== newFont);
  fonts.unshift(newFont);
  const newFontFamily = fonts.join(', ');
  config.update('editor.fontFamily', newFontFamily, true);
}

export function activate(context: ExtensionContext) {
  try {
    context.subscriptions.push(
      commands.registerCommand(cmds.setFont, () => openQuickPick())
    );
    console.log('Font Switch extension activated successfully');
  } catch (error) {
    console.error('Error activating Font Switch extension:', error);
  }
}

export function deactivate() {}
