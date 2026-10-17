$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Keep each per-file upload capped by MAX_UPLOAD_BYTES while allowing request
# overhead for one 512 MiB photo or video at a time.
php -d upload_max_filesize=512M `
    -d post_max_size=600M `
    -d max_file_uploads=100 `
    -d max_execution_time=600 `
    -d max_input_time=600 `
    -S 127.0.0.1:8766 -t public
