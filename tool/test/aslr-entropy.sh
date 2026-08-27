#!/usr/bin/env bash
# Reports the effective ASLR entropy of this machine.
#
# AddressSanitizer places its shadow at a fixed address on x86_64, so a runner whose
# vm.mmap_rnd_bits has been raised (>=32, the Ubuntu-24.04/kernel-6.8 default) can map libraries
# on top of it and kill the process before main, with no sanitiser report. Containers usually
# cannot read /proc/sys/vm/mmap_rnd_bits, so measure the entropy instead of asking for it.
set -u
SAMPLES=${1:-40}

echo "kernel: $(uname -r) ($(uname -m))"
echo "randomize_va_space: $(cat /proc/sys/kernel/randomize_va_space 2>/dev/null || echo unreadable)"
echo "vm.mmap_rnd_bits: $(cat /proc/sys/vm/mmap_rnd_bits 2>/dev/null || echo unreadable)"

python3 - "$SAMPLES" <<'PY'
import subprocess, sys
n = int(sys.argv[1])
addrs = []
for _ in range(n):
    out = subprocess.run(
        ["bash", "-c", "grep -m1 -E 'r(-|w)xp .*/libc' /proc/self/maps || grep -m1 'r-xp' /proc/self/maps"],
        capture_output=True, text=True).stdout
    if out.strip():
        addrs.append(int(out.split("-")[0], 16))
if not addrs:
    print("mmap entropy: could not sample mappings")
    sys.exit(0)
ones, zeros = 0, (1 << 64) - 1
for a in addrs:
    ones |= a
    zeros &= a
varying = ones & ~zeros
print(f"mmap entropy: samples={len(addrs)} distinct={len(set(addrs))} varying_bits={bin(varying).count('1')} "
      f"mask=0x{varying:x} min=0x{min(addrs):x} max=0x{max(addrs):x}")
print("  x86_64: ~28 varying bits is the kernel default; >=32 is the setting known to break ASan")
PY
