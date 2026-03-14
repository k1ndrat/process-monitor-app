param (
    [int]$duration = 15,
    [int]$interfaceIndex = 5
)

# 1. Налаштування
$wiresharkPath = "D:\SOFT\DEV\Wireshark"
$localIp = "192.168.31.83"

if (-not (Test-Path "$wiresharkPath\tshark.exe")) {
    return
}

# 2. Карта процесів
$procMap = @{}; $pidMap = @{}
Get-NetTCPConnection -State Established | ForEach-Object {
    $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) { 
        $key = "$($_.RemoteAddress):$($_.RemotePort)"
        $procMap[$key] = $proc.ProcessName
        $pidMap[$key] = $proc.Id
    }
}

# 3. Захоплення (приховано лічильник пакетів через 2>$null)
$tsharkArgs = @("-i", $interfaceIndex, "-a", "duration:$duration", "-T", "fields", "-e", "ip.src", "-e", "tcp.srcport", "-e", "ip.dst", "-e", "tcp.dstport", "-e", "frame.len", "tcp")
$packets = & "$wiresharkPath\tshark.exe" $tsharkArgs 2>$null

# 4. Обробка даних
$results = @{}
foreach ($pkt in $packets) {
    $fields = $pkt -split "\t"
    if ($fields.Count -lt 5) { continue }
    
    $srcIp = $fields[0]; $srcPort = $fields[1]; $dstIp = $fields[2]; $dstPort = $fields[3]; $len = [int]$fields[4]
    
    if ($srcIp -eq $localIp) { $remote = "${dstIp}:${dstPort}"; $dir = "Sent" } 
    else { $remote = "${srcIp}:${srcPort}"; $dir = "Received" }

    if (-not $results.ContainsKey($remote)) {
        $results[$remote] = [PSCustomObject]@{
            Process = if ($procMap.ContainsKey($remote)) { $procMap[$remote] } else { "System/Background" }
            PID     = if ($pidMap.ContainsKey($remote)) { $pidMap[$remote] } else { $null }
            Sent    = 0; Received = 0
        }
    }
    if ($dir -eq "Sent") { $results[$remote].Sent += $len } else { $results[$remote].Received += $len }
}

# 5. Групування по PID та створення JSON
$finalData = $results.Values | Group-Object PID | ForEach-Object {
    $totalS = ($_.Group | Measure-Object Sent -Sum).Sum
    $totalR = ($_.Group | Measure-Object Received -Sum).Sum
    [PSCustomObject]@{
        process   = $_.Group[0].Process
        pid       = if ($_.Name -ne "") { [int]$_.Name } else { $null }
        sent_kb   = [math]::Round($totalS / 1KB, 2)
        recv_kb   = [math]::Round($totalR / 1KB, 2)
        total_kb  = [math]::Round(($totalS + $totalR) / 1KB, 2)
    }
} | Sort-Object total_kb -Descending

# Збереження у файл
if ($finalData) {
    $finalData | ConvertTo-Json -Compress
} else {
    "[]" # Повертаємо порожній масив, якщо даних немає
}
# $finalData | ConvertTo-Json | Out-File $outputPath -Encoding utf8
# Write-Host "Success! JSON saved to: $outputPath" -ForegroundColor Green