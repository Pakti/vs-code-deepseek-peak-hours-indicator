# DeepSeek Peak Hours Indicator

A lightweight VS Code status-bar indicator for DeepSeek UTC peak hours.

- **DS PEAK** in orange-red, Monday-Friday at **01:00-04:00 UTC** and **06:00-10:00 UTC**.
- **DS OFF-PEAK** in blue by default otherwise, including Chinese public holidays.
- Both ranges are inclusive at the start and exclusive at the end.
- Weekends are always off-peak, even if marked as make-up working days in China.
- Uses **UTC date** for holiday lookup as well as UTC time for the schedule.
- A remaining-time countdown is appended to the status-bar label as `hh:mm`, rounded up to whole minutes and refreshed at minute boundaries. For durations over 24 hours, hours continue above 23 (for example `63:00`).
- Works offline; updates at schedule boundaries and each minute while VS Code is active.

## Develop

Requires Node.js 20+ and npm. Run `npm install`, then `npm test`. In VS Code, press F5 to run the extension development host.

To produce a distributable extension, run `npm run package`, then install the resulting VSIX with **Extensions: Install from VSIX...**.

## Tooltip

Hover over the indicator to see the next actual status change in your computer's
local timezone, using a 24-hour clock. For example: `PEAK until 12:00`,
`OFF-PEAK until tomorrow at 08:00`, or
`OFF-PEAK until Monday at 02:00`. Public holidays and weekends are
skipped when calculating the next switch. The tooltip refreshes automatically.

## Customize labels and colors

The status bar uses **foreground** colors only. Both colors can be customized in
`workbench.colorCustomizations`; by default peak uses `#ff4500` and off-peak uses `#3794FF`.

Set the two label strings in `deepseekPeakHours.peakLabel` and
`deepseekPeakHours.offPeakLabel`. Changes apply without restarting VS Code:

```json
{
  "deepseekPeakHours.peakLabel": "DS PEAK",
  "deepseekPeakHours.offPeakLabel": "DS OFF-PEAK",
  "workbench.colorCustomizations": {
    "deepseekPeakHours.peakForeground": "#ff4500",
    "deepseekPeakHours.offPeakForeground": "#3794FF"
  }
}
```

For example, with 2 hours and 15 minutes remaining, the indicator displays
`DS PEAK 02:15` or `DS OFF-PEAK 02:15`. The tooltip continues to display
the next switch in your local time.

## Holiday data caveat

The [date-holidays](https://www.npmjs.com/package/date-holidays) dependency supplies offline Chinese public holiday data. It selects only public holidays, not observances. Official arrangements can be released late, so update this dependency when annual Chinese State Council holiday schedules are announced. Unannounced future-year days may be inaccurate.

## License

MIT.
