
pip install howdoi





Reqs:
- go api for amcrest ip cam api (is one avaiable?)
- go server 
	- secured with OAuth2 - use jwt - may need seperate microservice... maybe it becomes THE bcloud auth system?
	- GET snapshot-montage/:image-dims/:cameras
	- GET snapshot-montage/:image-dims
		-- Gets a snapshot for each or all camera(s).
	- WS camera-stream/:camera-id
	- WS camera-stream/:camera-id, date-start,date-end
		-- Historical info, app must have access to storage to allow this.  App should autoclear videos older than 2-8 weeks.  
	- GET storage-status
		-- Get space remaining and crap like that. 
	- App should autoclear videos older than 2-8 weeks. however use seperate rsync procedure to backup elsewhere (LTS at home, or cloud, ENCRYPTED).

- GUI
	- On montage view, call for snapshot every few seconds.  
	- On camera view, request ws stream.
	- Should be a grid of camera snapshots = montage.  Then on camera click, it expands to full view.

KServer Containers
- OS: coreos, arch, kaos
- DE: Gnome, XFCE4, Cinnamon

	FileServer
	- samba/smbv2 fileserver
		- contacts
		- shared folders (and provsion scripts for clients)

	SPCS VM
	- Can use a script that runs virtualbox on nomad, or use nomads' native qemu.
	   - vbox image should be pull from a precreated image with everything setup.
	   - https://ariya.io/2012/08/qemu-on-ubuntu-to-run-windows
	   - cron job for image snapshot backups.

KWorkstations
- shared folder + contacts provision script
  - attach folders (every boot)
  - set hostname
  - log backups somewhere i can see when there is trouble.
- virtual box pull image, and create vm
- autostart teamviewer service on boot




"have us call you"
click -> phone entry -> ok button
gets sent off, now more form fields show.
can say they can continue later.  Use phone as verification device. to continue on from some point.


==================================================================


Sync OpenLDAP and GCloud Directory
https://medium.com/google-cloud/setting-up-google-directory-sync-with-openldap-9977d0bef26f
- would pick selec network users.  Actually want to do this in reverse.  Change pw on GCloud and have it affect mac.

To get started just skip ldap, use local user accounts, use one-off passwords for samba.

==================================================================




# RESIZE RHEL 7 SWAP

## Reduce root LV Size

Boot Centos Live

```
sudo su -
lsblk; df -HT
vgchange -a y  											  # Load LVM volumes
umount /dev/mapper/rhel-root          # If necc
e2fsck -fy /dev/mapper/rhel-root      # Check file system
resize2fs /dev/mapper/rhel-root 41G   # Resize FS to 41GB !!Should be smaller than target!!
lvreduce -L 42G /dev/mapper/rhel-root # Resize LV to 42GB
resize2fs /dev/centos/var             # Expand FS to fit LV
```

## Expand Swap Space

(Calling `swapoff` online is super slow)

Boot into regular machine.

```
sudo su
swapoff -v /dev/mapper/rhel-swap
lvm lvresize /dev/mapper/rhel-swap -L +8G
mkswap /dev/mapper/rhel-swap
swapon -va
cat /proc/swaps && free
```

[test](https://www.centos.org/docs/5/html/5.1/Deployment_Guide/s2-swap-extending-lvm2.html)



############################################################
# Nix Nodejs
############################################################


Q: What a script for a local dev npm porject would look like


https://zef.me/deploying-a-simple-node-js-application-with-nixops-c290270612bf

Pretty much use the first part.  The networking and supervision is to be done by nomad + consul.


The first part isntalls required node versions, and will run required scripts
`npm i, npm publish`.
- should be able to do both production and dev builds in the same file, probably using different nix-envs to namespace.

Then it should be easy to 'compile' or 'run' this file using a one-liner:
TODO: <one liner here>


So what we do with nomad
- We now create a nomad job spec, prob a isolated fork/exec that calls the one-liner above.
- In the same file we configure consul networking.


- only need single client+server instances of nomad and consul running on a single vm.

- in QA/Staging, using Terraform we would spinup ondemand a hardware config matching production, to get as real as testing as possible.



### Is there a need for nomad/consul in dev? ###

Point of running nomad in dev:
- So that we can write startup docs/scripts in 1 way (only config vars should change into production)

Problems:
- Live file reload!  A: Really not a nomad problem.
Vagrant can sync files. Nomad shouldnt care, nomad will run say nodemon in dev,
nodemon, looks at the files that vagrant is syncing, and reloads accordingly.



# Different versions of same program
# Handling different program versions with nix configs
The way nix versioning works, for pacakges like node, we would pull say node_8,
what happens is that we always get the latest node_8, however with semantic versioning we should be ok from breaking changes, and gain security and bug patch benefits.  Or literally publish a new nix config file for each version of the app you want to build for.



The fact the nix-pkg works with mac is game changer, we may now be able to use the same pretty much everything udring dev as prod.



http://lethalman.blogspot.com/2015/02/nixos-consul-nginx-and-containers.html
https://zef.me/deploying-a-simple-node-js-application-with-nixops-c290270612bf





############################################################
# RULES FOR SWAP SPACE
############################################################

* If you need a low-latency server or workstation and all of your processes are killable (i.e. they can be easily/automatically restarted without data loss): disable swap.

* If you need a low-latency server or workstation and some of your processes are not killable (e.g. databases): enable swap and set vm.swappiness to 0.
* SSD-backed desktops and other servers and workstations: enable swap and set vm.swappiness to 1 (for NAND flash longevity).

* Disk-backed desktops and other servers and workstations: accept the system/distro defaults, typically swap enabled with vm.swappiness set to 60. You can and likely should lower vm.swappiness to 10 or so if you have a ton of RAM relative to your workload.

* If your server or workstation has a mix of killable and non-killable processes, use oom_score_adj to protect the non-killable processes.

* Monitor systems for swap (page-out) activity.

---

* vm.swappiness = 0	The kernel will swap only to avoid an out of memory condition, when free memory will be below vm.min_free_kbytes limit.
* vm.swappiness = 1	Minimum amount of swapping without disabling it entirely.
* vm.swappiness = 60	The default value.
* vm.swappiness = 100	The kernel will swap aggressively.





############################################################
# TODO
############################################################

# Mac Administration
https://github.com/coconauts/IP-change/blob/master/ip_change.py
http://www.soma-zone.com/LaunchControl/

# Packer Windoze Templates
https://github.com/mwrock/packer-templates

# Nix Cheatsheet
https://github.com/knedlsepp/nix-cheatsheet/blob/master/examples/nix-env/ad-hoc.md
https://github.com/knedlsepp/nix-cheatsheet/tree/master/examples/nix-shell

Check these to manage dotfiles and NixUp for declartive config.
https://github.com/knedlsepp/nix-cheatsheet/blob/master/examples/nix-env/declarative-user-environment.md



# NODEKIT FOR XPLATFORM APPS

https://nodekit.io/docs/index.html#iOS-and-MacOS-platforms
https://github.com/nodekit-io/nodekit-android


# MPD and fzf
https://github.com/junegunn/fzf/wiki/Examples#mpd



# Can use JS to write gnome extenstions!
https://github.com/N-Yuki/gnome-shell-extension-workspace-isolated-dash/blob/master/workspace-isolated-dash/extension.js
--- Hey what if we built a DM based on Vue ;)
Fully reactive.  Might even go well with nix.


# Way to write mac automator scripts in js.
dig futher this was just what let me know it was possible.
https://github.com/junegunn/fzf/wiki/On-MacVim-with-iTerm2
Here is JavaScript (JXA) mutation (by @chew-z):

#!/usr/bin/env osascript -l JavaScript




## linux-admin-made-easy
http://www.tldp.org/LDP/lame/LAME/linux-admin-made-easy/shadow-file-formats.html




To install OMF theme with fisher:

fisher omf/plugin-<name-of-theme>
fisher omf/theme-<name-of-theme>

fisher ls-remote
fisher ls


# FZF
Ctrl-t	Ctrl-f	Find a file.
Ctrl-r	Ctrl-r	Similar to ^
Ctrl-x	Alt-x	Does the reverse isearch, and immediately executes command.
Alt-c	Alt-o	cd into sub-directories (recursively searched).
Alt-Shift-c	Alt-Shift-o	cd into sub-directories, including hidden ones.



https://github.com/JorgeBucaran/fish-shell-cookbook



set foo 42
The set builtin accepts the following flags to explicitly declare the scope of the variable:

-l, --local: available only to the innermost block
-g, --global: available outside blocks and by other functions
-U, --universal: shared between all fish sessions and persisted across restarts of the shell
-x, --export: available to any child process spawned in the current session





thefuck issue

https://github.com/fisherman/fisherman/issues/408



~/.config/fish/functions/fish_user_key_bindings.fish
prob go with config.fish instead





Vuw multiselect had a great development flow tools UX. Copy that for our template.