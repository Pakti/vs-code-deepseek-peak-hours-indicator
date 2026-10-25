import * as vscode from 'vscode';
import { isPeak, nextBoundary, nextStatusChange, formatStatusTooltip } from './schedule';

export function activate(context: vscode.ExtensionContext): void {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.name = 'DeepSeek Peak Hours';
  context.subscriptions.push(item);
  let timer: NodeJS.Timeout | undefined;
  let disposed = false;

  function refresh(): void {
    if (disposed) return;
    if (timer) clearTimeout(timer);
    const now = new Date();
    const peak = isPeak(now);
    item.text = peak ? 'PEAK' : 'OFF-PEAK';
    item.color = new vscode.ThemeColor(peak ? 'deepseekPeakHours.peakForeground' : 'deepseekPeakHours.offPeakForeground');
    item.tooltip = formatStatusTooltip(now, nextStatusChange(now), peak);
    item.show();
    // Refresh at boundaries and at most once per minute to mitigate system clock changes.
    const remaining = nextBoundary(now).getTime() - now.getTime();
    timer = setTimeout(refresh, Math.max(100, Math.min(remaining + 50, 60_000)));
  }

  refresh();
  context.subscriptions.push({ dispose: () => {
    disposed = true;
    if (timer) clearTimeout(timer);
  }});
}

export function deactivate(): void {}
