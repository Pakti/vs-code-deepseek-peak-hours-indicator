# DeepSeek Peak Hours Indicator

A lightweight VS Code status-bar indicator for DeepSeek UTC peak hours.

- **PEAK** in muted red, Monday-Friday at **01:00-04:00 UTC** and **06:00-10:00 UTC**.
- **OFF-PEAK** in muted green otherwise, including Chinese public holidays.
- Both ranges are inclusive at the start and exclusive at the end.
- Weekends are always off-peak, even if marked as make-up working days in China.
- Uses **UTC date** for holiday lookup as well as UTC time for the schedule.
- Works offline; updates at clock boundaries and at least once per minute while VS Code is active.

## Develop

Requires Node.js 20+ and npm. Run `npm install`, then `npm test`. In VS Code, press F5 to run the extension development host.

To produce a distributable extension, run `npm run package`, then install the resulting VSIX with **Extensions: Install from VSIX...**.

## Colors

The status bar **text** is colored, not the item background. Defaults on dark themes are red `#c56b6b` and green `#79ae89`. Customize using:

```json
{
  "workbench.colorCustomizations": {
    "deepseekPeakHours.peakForeground": "#c56b6b",
    "deepseekPeakHours.offPeakForeground": "#79ae89"
  }
}
```

## Holiday data caveat

The [date-holidays](https://www.npmjs.com/package/date-holidays) dependency supplies offline Chinese public holiday data. It selects only public holidays, not observances. Official arrangements can be released late, so update this dependency when annual Chinese State Council holiday schedules are announced. Unannounced future-year days may be inaccurate.

## License

MIT.
