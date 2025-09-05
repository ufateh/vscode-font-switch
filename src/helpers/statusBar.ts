import { workspace } from 'vscode';
import { strings } from './constants';

export function getCurrentFont(): string {
  const config = workspace.getConfiguration();
  const current = config.get<string>(strings.editorFontFamily) || 'Consolas';
  return current.split(',')[0].trim();
}
