/**
 * What is worth checking before a match depends on the device, not just the
 * title: a phone's thermal headroom and battery matter for Mobile Legends the
 * way frame pacing matters on PC.
 */
const SHARED = [
  { id: 'd1', label: 'Ping', value: '24ms', state: 'pass' },
  { id: 'd2', label: 'Packet loss', value: '0.0%', state: 'pass' },
  { id: 'd3', label: 'Mic check passed', value: 'Input -12dB', state: 'pass' },
  { id: 'd4', label: 'Comms server', value: 'Nearest region', state: 'pass' },
]

const BY_PLATFORM = {
  Mobile: [
    { id: 'm1', label: 'Battery', value: '84%', state: 'pass' },
    { id: 'm2', label: 'Thermal headroom low', value: '41°C', state: 'warn' },
    { id: 'm3', label: 'Background apps closed', value: '2 running', state: 'warn' },
    { id: 'm4', label: 'Wi-Fi band', value: '5GHz', state: 'pass' },
    { id: 'm5', label: 'Do not disturb on', value: 'Enabled', state: 'pass' },
    { id: 'm6', label: 'Touch sampling', value: '240Hz', state: 'pass' },
  ],
  Console: [
    { id: 'c1', label: 'Controller battery', value: '92%', state: 'pass' },
    { id: 'c2', label: 'Wired connection', value: 'USB-C', state: 'pass' },
    { id: 'c3', label: 'Display latency mode', value: 'Game mode on', state: 'pass' },
    { id: 'c4', label: 'Refresh rate', value: '120Hz', state: 'pass' },
  ],
  PC: [
    { id: 'p1', label: 'Peripherals detected', value: '3 devices', state: 'pass' },
    { id: 'p2', label: 'Frame rate unstable', value: '112-240fps', state: 'warn' },
    { id: 'p3', label: 'GPU driver', value: 'Up to date', state: 'pass' },
    { id: 'p4', label: 'Polling rate', value: '1000Hz', state: 'pass' },
  ],
}

export const diagnosticsFor = (platform) => [...SHARED, ...(BY_PLATFORM[platform] ?? BY_PLATFORM.PC)]

export const networkMetricsFor = (platform) =>
  platform === 'Mobile'
    ? [
        { label: 'Ping (avg)', value: '31ms' },
        { label: 'Ping (p99)', value: '88ms' },
        { label: 'Peak temp', value: '41°C' },
        { label: 'Frame drops', value: '4 / 10m' },
      ]
    : [
        { label: 'Ping (avg)', value: '24ms' },
        { label: 'Ping (p99)', value: '61ms' },
        { label: 'Jitter', value: '3.1ms' },
        { label: 'Packet loss', value: '0.0%' },
      ]
