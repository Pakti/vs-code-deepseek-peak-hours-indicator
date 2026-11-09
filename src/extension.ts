import * as vscode from 'vscode';
import { isPeak, nextBoundary, nextStatusChange, formatStatusTooltip, formatRemainingTime } from './schedule';

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
    const change = nextStatusChange(now);
    const config = vscode.workspace.getConfiguration('deepseekPeakHours');
    const label = config.get<string>(peak ? 'peakLabel' : 'offPeakLabel', peak ? 'DS PEAK' : 'DS OFF-PEAK');
    item.text = `${label} ${formatRemainingTime(now, change)}`;
    item.color = new vscode.ThemeColor(peak ? 'deepseekPeakHours.peakForeground' : 'deepseekPeakHours.offPeakForeground');
    item.tooltip = formatStatusTooltip(now, change, peak);
    item.show();

    // Refresh just after each minute boundary so the countdown stays accurate.
    // Also recheck at schedule boundaries to mitigate clock changes.
    const remaining = nextBoundary(now).getTime() - now.getTime();
    const nextMinute = 60_000 - (now.getTime() % 60_000) + 50;
    timer = setTimeout(refresh, Math.max(100, Math.min(remaining + 50, nextMinute, 60_000)));
  }

  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('deepseekPeakHours')) refresh();
  }));
  refresh();
  context.subscriptions.push({ dispose: () => {
    disposed = true;
    if (timer) clearTimeout(timer);
  }});
}

export function deactivate(): void {}
