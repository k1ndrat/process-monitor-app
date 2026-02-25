import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function getIconBase64(filePath: string): Promise<string | null> {
  if (!filePath) return null;

  const cleanPath = filePath.replace(/^"|"$/g, "").trim();
  const pathBase64 = Buffer.from(cleanPath, 'utf16le').toString('base64');

  const psCommand = `
    try {
      Add-Type -AssemblyName System.Drawing;
      $path = [System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String('${pathBase64}'));
      if (Test-Path $path) {
        $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($path);
        $bitmap = $icon.ToBitmap();
        $stream = New-Object System.IO.MemoryStream;
        $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png);
        $base64 = [Convert]::ToBase64String($stream.ToArray());
        Write-Output $base64;
      }
    } catch {
    }
  `.replace(/\n/g, ' ');

  try {
    const { stdout } = await execAsync(`powershell -NoProfile -Command "${psCommand}"`);
    const base64 = stdout.trim();
    
    return base64 ? `data:image/png;base64,${base64}` : null;
  } catch (error) {
    console.log(error);
		return null;
  }
}