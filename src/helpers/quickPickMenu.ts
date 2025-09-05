import { getCurrentFont } from './statusBar';
import { QuickPickItem, window, workspace } from 'vscode';
import { strings } from './constants';
import { setFontFamily } from '../extension';

const placeHolder = strings.quickPickPlaceholder;
const ADD_FONT_LABEL = '$(add) Add New Font';
const REMOVE_FONT_LABEL = '$(remove) Remove Font';

export async function openQuickPick() {
  try {
    // Check if VS Code APIs are available
    if (!workspace || !window) {
      throw new Error('VS Code APIs not available');
    }

    const config = workspace.getConfiguration();
    const originalFontFamily = config.get<string>('editor.fontFamily') || '';
    const originalFonts = originalFontFamily.split(',').map(f => f.trim()).filter(f => f);
    let accepted = false;
    let lastPreviewedFont = originalFonts.length > 0 ? originalFonts[0] : '';

    const quickPick = window.createQuickPick();
    if (!quickPick) {
      throw new Error('Failed to create QuickPick');
    }

    quickPick.placeholder = placeHolder;
    quickPick.items = _createQuickPickOptions(originalFonts);

    quickPick.onDidChangeActive(activeItems => {
      if (activeItems.length > 0) {
        const activeItem = activeItems[0];
        // Check if it's a font item (not the special add/remove options)
        if (activeItem.label !== ADD_FONT_LABEL && activeItem.label !== REMOVE_FONT_LABEL) {
          const font = activeItem.label;
          if (font !== lastPreviewedFont) {
            lastPreviewedFont = font;
            _setTempFontFamily(font, originalFonts, config);
          }
        }
      }
    });

    quickPick.onDidAccept(() => {
      accepted = true;
      const selectedItem = quickPick.selectedItems[0];
      if (selectedItem) {
        if (selectedItem.label === REMOVE_FONT_LABEL) {
          _handleRemoveFont(originalFontFamily);
        } else if (selectedItem.label === ADD_FONT_LABEL) {
          _handleAddNewFont(originalFontFamily);
        } else {
          const font = selectedItem.label;
          setFontFamily(font);
        }
      }
      quickPick.hide();
    });

    quickPick.onDidHide(() => {
      if (!accepted) {
        // Revert to original
        config.update('editor.fontFamily', originalFontFamily, true);
      }
      quickPick.dispose();
    });

    quickPick.show();
  } catch (error) {
    console.error('Error in openQuickPick:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    window.showErrorMessage(`Font Switch error: ${errorMessage}`);
  }
}

function _createQuickPickOptions(currentFonts: string[]): QuickPickItem[] {
  const allFonts = [...new Set(currentFonts)];

  // If no fonts are available, show a message
  if (allFonts.length === 0) {
    return [
      { label: 'No fonts found in editor.fontFamily', description: 'Add fonts to your settings first' },
      { label: ADD_FONT_LABEL },
      { label: REMOVE_FONT_LABEL }
    ];
  }

  const options: QuickPickItem[] = allFonts.map(font => {
    const opt: QuickPickItem = { label: font };
    if (font === currentFonts[0]) {
      opt.description = strings.current;
    }
    return opt;
  });

  options.push({ label: ADD_FONT_LABEL });
  options.push({ label: REMOVE_FONT_LABEL });

  return options;
}

function _setTempFontFamily(newFont: string, originalFonts: string[], config: any) {
  const fonts = originalFonts.filter(f => f && f !== newFont);
  fonts.unshift(newFont);
  const tempFontFamily = fonts.join(', ');
  config.update('editor.fontFamily', tempFontFamily, true);
}

async function _handleRemoveFont(original: string) {
  const currentFonts = original.split(',').map(f => f.trim()).filter(f => f);
  if (currentFonts.length <= 1) {
    window.showInformationMessage('Cannot remove the last font.');
    return;
  }
  const removeOptions = currentFonts.map(font => ({ label: font }));
  const toRemove = await window.showQuickPick(removeOptions, { placeHolder: 'Select font to remove' });
  if (toRemove) {
    const updatedFonts = currentFonts.filter(f => f !== toRemove.label);
    const config = workspace.getConfiguration();
    config.update('editor.fontFamily', updatedFonts.join(', '), true);
  }
}

async function _handleAddNewFont(original: string) {
  const newFont = await window.showInputBox({ prompt: 'Enter new font name' });
  if (newFont) {
    const fonts = original.split(',').map(f => f.trim()).filter(f => f);
    fonts.unshift(newFont.trim());
    const config = workspace.getConfiguration();
    config.update('editor.fontFamily', fonts.join(', '), true);
  }
}
