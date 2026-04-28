#!/usr/bin/env python3
import paramiko
import os
import time

hostname = '167.86.118.96'
port = 22
username = 'root'
password = 'Saroobidy10289#'

local_path = '/home/tech-0002/Téléchargements/a-vos-emplettes/server'
remote_path = '/home/emplette'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

print(f"Connexion à {hostname}...")
ssh.connect(hostname, port, username, password)

print("Création du dossier distant /home/emplette...")
stdin, stdout, stderr = ssh.exec_command(f'mkdir -p {remote_path}')
print(stderr.read().decode(), end='')

print("Transfert des fichiers...")

sftp = ssh.open_sftp()

def upload_directory(sftp, local_dir, remote_dir):
    for item in os.listdir(local_dir):
        local_item_path = os.path.join(local_dir, item)
        remote_item_path = f"{remote_dir}/{item}"
        
        if os.path.isfile(local_item_path):
            print(f"  Copie: {item}")
            sftp.put(local_item_path, remote_item_path)
        elif os.path.isdir(local_item_path):
            print(f"  Création dossier: {item}/")
            try:
                sftp.stat(remote_item_path)
            except:
                sftp.mkdir(remote_item_path)
            upload_directory(sftp, local_item_path, remote_item_path)

upload_directory(sftp, local_path, remote_path)

sftp.close()

print("\nInstallation des dépendances Node.js...")
stdin, stdout, stderr = ssh.exec_command(f'cd {remote_path} && npm install')
while not stdout.channel.exit_status_ready():
    time.sleep(0.1)
print(stdout.read().decode())
print(stderr.read().decode())

print("\n✅ Backend déployé avec succès dans /home/emplette!")

ssh.close()
