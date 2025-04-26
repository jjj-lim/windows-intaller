rmdir /s /q dist
rmdir /s /q node_modules
rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache"

npm install
npm run dist


Belajar Nginx 

- sudo apt install p7zip-full
- 7z a /var/www/html/downloads/gambar.7z /var/www/html/uploads/images/
a = add
File hasil = gambar.7z
Isi = semua file dalam uploads/images/