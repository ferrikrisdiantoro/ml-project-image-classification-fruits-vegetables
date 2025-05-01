import gdown

# Link folder Google Drive (gunakan share link yang diubah ke format ini)
folder_url = 'https://drive.google.com/drive/folders/1myyaQp343tEodkPmSkH_nXpwUtRvf6Sf?usp=sharing'

# Lokasi folder lokal tempat menyimpan file yang didownload
output_folder = '/home/ferrikrisdiantoro/Image-Classification-Ensamble-Swin-and-Rest/backend/'  # kamu bisa ganti nama folder lokalnya

# Download seluruh isi folder
gdown.download_folder(
    id=None,
    url=folder_url,
    output=output_folder,
    quiet=False,
    use_cookies=False
)

print(f"Semua file berhasil diunduh ke folder {output_folder}")
