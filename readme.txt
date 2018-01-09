
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



==================================================================


Sync OpenLDAP and GCloud Directory
https://medium.com/google-cloud/setting-up-google-directory-sync-with-openldap-9977d0bef26f
- would pick selec network users.  Actually want to do this in reverse.  Change pw on GCloud and have it affect mac.

To get started just skip ldap, use local user accounts, use one-off passwords for samba.

==================================================================


Nomad Pros vs Kube
- Bare metal performance possible. No containerization overhead required.
- Uses chroot and cgroup to securely isolate applications.
- Built to allow global datacenter clusters.
- Very simple programs, easy to learn and use, low attack surface.

Nomad only aims to provide cluster management and scheduling

Nomad supports virtualized, containerized and standalone applications, including Docker.



Consul is a service discovery application which can make each individual service in the cluster visible to each other.

Consul Features
- service discovery (DNS)
- health checking

ping elasticsearch.service.consul


Primary Read First
https://www.nomadproject.io/docs/drivers/exec.html
https://www.nomadproject.io/guides/cluster/requirements.html


Secondary
https://github.com/hashicorp/consul-template


Resources
https://medium.com/@copyconstruct/schedulers-kubernetes-and-nomad-b0f2e14a896



This is perfect for both IoT and Mining.
- Nomad Clients can run on rasberry pi's.
- Since there is no is no heavy weight virtualization, simply chroot and cgroup,
running nvidia and amd drivers should be just like without using nomad at all.


Provisioning Base Image
- Keep it to the nomad agent only, if possible.
- Everything else is done with services and their configs. (consul, logging infrastructure, monitoring agents, dnsmasq etc.)



https://github.com/hashicorp/consul-template

we use HAProxy, whose config gets redrawn by Consul-Template. Zero downtime HAProxy reloads are slightly more complicated than described above



Terraform
- File copying.
- Hardware provisioning.
- Can add kvs to consul, so apps can pull their config dynamically now.
  (Or just specify env vars in the apps' nomad job file)

Use in layers
1. setup the physical infrastructure running the nomad schedulers
2. provisioning onto the scheduled grid



Storage
Simply run a file-server docker image job on nomad, which is assigned to a
particular physical node.  This resource can then be published to consul so it can be accessed on the network.

VPN
Same as above.




https://www.digitalocean.com/community/tutorials/how-to-configure-consul-in-a-production-environment-on-ubuntu-14-04

Reasons for Nomad:
Krypton Office Backups
Kryton Website
Tibra Website


Classified:
Mining
Jupyter

could keep centos.
run nomad in dev mode or as part of cluster.
create a nomad job local exec that runs the mining script.
create a nomad job docker that runs jupyter




this is why vagrant is so great in dev..
it is what allows us to mimic production in dev.  Even though its more heavy weight than docker

thing is we shouldnt be using a container for everything, whihc means, shouldnt have many vms.

The reason why we dont need nomad jobs descriptions in dev is bc they are literally only
a command to run, and potentially env vars, which should really come from consul anyway, in dev they can also come from a config file.




Dev Flow

- only need single client+server instances of nomad and consul running on a single vm.

- in QA/Staging, using Terraform we would spinup ondemand a hardware config matching production, to get as real as testing as possible.



But really, is there a need for nomad in dev?
Point of running nomad in dev:
- So that we can write startup docs/scripts in 1 way (only config vars should change into production)

- Live file reload!  A: Really not a nomad problem.
Vagrant can sync files. Nomad shouldnt care, nomad will run say nodemon in dev,
nodemon, looks at the files that vagrant is syncing, and reloads accordingly.


Dev Local vs Dev VM
tldr: Use Vagrant VM in dev, use that image in prod

Advantages using VagrantVM
- if any install goes wrong we can easily redo.
- The bootstrap scripts are built from beginning, instead of figuring out all reqs at publish time.
- No need to write one script for mac install and another for prod.
We will get ability to run same OS we would use in production, and now don't need to modify bootstrap shell scripts.





When writing docker files we are really just writing shell scripts.
The only advantage docker really gives is incremental compile, but who really cares?
point is, by writing bash files we are esentially doing the same we did with docker.

Do want to run nomad in dev, bc we get more similar to prod.
Also consul bc changing to use its dns in prod is likely non-trivial. However scaling up both of these programs is trivial.



https://github.com/pete0emerson/hashipoc
- in vagrantfile calls bunch of shell scripts, that install libs,
install nomad and freinds, install app.




Nomad can always be run in dev mode, which means client and server are on same machine.






Terraform
- Only required in production and QA/staging.
	- For dev we dont need to setup infrastructure, its simply vagrant up, so there is no need for Terraform.









Local development with nomad is also much simpler
consul agent -dev
sudo nomad agent -dev
nomad run job.nomad



can dev with same vagrantfile we evetually push to production. (image built with packer)
vagrant push

however since we are dealing with multiple machines and this and that, we go thru terraform.

possibility 1.  rolling upgrade.
os update:
image is built and tested with vagrant.
when satisfied nomad will bring 1 machine down at a time, gracefully, update it,
start it back up, and move on to next one.
its actually terraform that is in control of the deploy process.



Rkt and LXC can run Docekr stuff. I think rkt provides the best security + perf.  figure out best to go with, when we do want conatiners.

What the containerization stuff provides over chroot+cgroup is isolation of the network layer and more.
- But that network isolation is really unneccessary when viewed in silo.

For things that require a lot of setup, or that we simply dont require 100% perf out of, we can do as docker containers.
But that should be very few.


# Upgrading Servers:

Would write a bash script that does graceful shutdown of jobs on node, and updates os.
This would exec as a nomad job, tied to specific server.  Use consul kv store to limit # machines upgrading, and to track status.
Or can get ip of each node from consul, ssh in to each, running bash script.
And this could be made into a job to run on cluster.
  - But to do that we must write logic so that when executing node gets upgraded the script will gracefully restart on another node, ideally an upgraded one.

Prob best to write as a terraform script and just make sure the host laptop running it doesnt go down, and that everything can resume normally if it does disconnect.

Or maybe this is where puppet (or salt) comes in?
- terraform can be used with puppet or salt https://www.terraform.io/docs/provisioners/salt-masterless.html

Terraform vs. Chef, Puppet, etc.
Configuration management tools install and manage software on a machine that already exists. Terraform is not a configuration management tool, and it allows existing tooling to focus on their strengths: bootstrapping and initializing resources.

Using provisioners, Terraform enables any configuration management tool to be used to setup a resource once it has been created. Terraform focuses on the higher-level abstraction of the datacenter and associated services, without sacrificing the ability to use configuration management tools to do what they do best.

tldr: terraform for intial setup of machine.  salt for updates and stuff?




Packer -> Vagrant
- Packer does the image building, app lib loading, app copying,

Use packer post-processor vargrant, and use vagrantfile_template with a folder sync option set for dev flow file sync.



with Packer you can repeatably create Docker images without the use of a Dockerfile. 
You don't need to know the syntax or semantics of Dockerfiles. 
Instead, you can just provide shell scripts, Chef recipes, Puppet manifests


{
	
	"post-processors": [
		[
		  {
		    "type": "vagrant",
		    "keep_input_artifact": false,
		    "vagrantfile_template": 
		  },
		]
   ]
}


For dev: Packer: use docker builder.  only config is the base os image to use.
If we moved to LXD or VirtualBox it would simply be pulling same os from lxd repo or from main os site.

Then we use File/Shell provisioners to execute the bash scripts to install our programs.


lkt builds up from scratch to the bare minimum you need; Packet builds from an existing OS base.
lkt's security surface of attack will be smaller, because it starts not with an existing OS, but with, well, nothing.
lkt images can be significantly smaller, because you add in only precisely what you need.
lkt builds run locally. Packer essentially spins up a VM (vbox, EC2, whatever), runs some base image, modifies it per your instructions, and then saves it as a new image. lkt just manipulates OCI images by downloading and copying files to create a new image.

LinuxKit competes with packer, it seems to have more features.
- Big plus: Can build images that run on Mac's xhyve (HyperKit).  So it is just as fast as docker in dev!
- BigPlus: Literally only run the services neccessary.  => Truly minimal and lean VMs.
- beleive it is using runc + containerd instead of something like DockerEngine.  Seems to have Qemu as well.
  - Note this is for containers running inside the VM.  Not the VM itself.

  We can install any container runtime we would like.  What we need to do is simply isntall nomad, and run shell scripts.
  No need for linuxkit to handle containers for us.

linuxkit.yml Examples:
https://github.com/linuxkit/linuxkit/tree/master/examples

Packages:
https://github.com/linuxkit/linuxkit/blob/master/docs/packages.md
https://github.com/linuxkit/linuxkit/tree/master/pkg


Netflix has a chaos monkey that randomly burns down servers in order to test that their system is resilient.
https://medium.com/netflix-techblog/the-netflix-simian-army-16e57fbab116





!!! I beleive both linuxkit and buildah 

Thing with linuxkit is doesnt build the whole OS.  So we can use say the centos kernel, but no guarentee
nvidia drivers will run without userspace setup.  Also lkt really bothers me in the runtime services,
for development this could be a royal pain to figure out these deps.
But look, the clear advantage here is a resultant barebones os.
Possible to use lkt to build only some images.




lkvm or qemu-kvm
- Considered safe to run untrusted programs in.


rkt
- uses runc which is contolled by containerd.

docker
- uses runc and containerd, but rkt has advantages in priviledge (security), philosophy (unix), 


Skopeo
In order to get an OCI image, you need to convert it from another container image format. Luckily, as the OCI spec was based on the Docker image format, there is no loss of information when converting between the two formats. skopeo is an incredibly useful tool that allows you to fetch and convert a Docker image (from a registry, local daemon or even from a file saved with docker save) to an OCI image (and vice-versa)



Image Builder: umoci
Host OS: Dev on Mac = 


If we want xhyve on mac, then just use vagrant-xhyve.  Dont let this determine our path.



Load Balancing
- consul-haproxy
https://www.hashicorp.com/blog/haproxy-with-consul
https://www.hashicorp.com/blog/load-balancing-strategies-for-consul
- These are other strats.  But consul-haproxy seems to be best approach, also newer than whats here.




Server OS
- Debian, Ubuntu, CentOS
Hashicorp by default uses ubuntu for their nomad consul demos.







server choice prob doesnt matter so much.
prob dont want rolling updates as its bound to eventually break?

want to use nomad in dev bc that is how we exec rkt containers 




CoreOS
- Problem is we would have to run nomad in an rkt container.
And somehow setup so that nomad starts procs in host and not in container.
- Also rolling updates. But id say this is the one release where this is ok.



Ubuntu
- apt goes a long way to making things 'just work'

Debian
- apt goes a long way to making things 'just work'
- extra security & stability over ubuntu. ..?

CentOS
- Easy to install amd+nvidia drivers, so if its not easy on ubuntu or debian, we should stick with it.  Also wasnt it centos that was the only one able to queitly run the gpu fans?



# Storage

## GlusterFs
https://github.com/gluster/gluster-containers


# Tech
- List each technology as title.
- Then write bullet points about each in the scheme of things.
## Other Tech
- If there are indepth relations then indent subtitles.





Figure out some way to track requests maybe graphically.




Might be possible to use Vault's Filesystem storage mechanism, to store program data.  (Or any of its other backends)

Otherwise, we can run samba containers bound to physical machines by label.




# RESIZE RHEL 7 SWAP

su
swapoff -v /dev/mapper/rhel-swap
lvm lvresize /dev/mapper/rhel-swap -L +8G
mkswap /dev/mapper/rhel-swap
swapon -va
cat /proc/swaps && free

https://www.centos.org/docs/5/html/5.1/Deployment_Guide/s2-swap-extending-lvm2.html


# (Safer) From Boot Iso

Boot Manjaro
sudo su -
lsblk
cryptsetup luksOpen /dev/sdaXXX cryptdisk
gparted

https://medium.com/@tbeach/resize-an-encrypted-partition-without-breaking-your-linux-system-6ef475619745




Bare metal clouds, essentially just buying a dedicated server. So there isnt the overhead of the cloud provider's  multi-tenant virtualization system.  DO uses KVM/QEMU, this adds overhead, but allows us to spin droplets up and down quickly.  Baremetal makes sense in some production.  But idk, more resources, lower price, mght be perfect?



Once you do nixos collect-garbage -d, you know that your system is only left with what it needs. Nothing more, nothing less.


Hydra is a Nix-based continuous build system, rel
https://nixos.org/hydra/manual/


flow
use nixpkgs as a base, lock versions down for each 'project'.



OMG NIX AS AN OSX PACKAGE MAN - UTOPIA REACHED
https://ariya.io/2016/05/nix-as-os-x-package-manager

nix-darwin



We use NixOS in production in our product, for our cloud services, and for some development environments.

We build everything with nix from sbt projects, go projects, haskell projects, purescript projects, docker images, and npm projects.

It's an incredible tool.


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



The way nix versioning works, for pacakges like node, we would pull say node_8,
what happens is that we always get the latest node_8, however with semantic versioning we should be ok from breaking changes, and gain security and bug patch benefits.



The fact the nix-pkg works with mac is game changer, we may now be able to use the same pretty much everything udring dev as prod.



http://lethalman.blogspot.com/2015/02/nixos-consul-nginx-and-containers.html
https://zef.me/deploying-a-simple-node-js-application-with-nixops-c290270612bf





mwpmaybe 319 days ago [-]

My personal rules of thumb for Linux systems. YMMV.
* If you need a low-latency server or workstation and all of your processes are killable (i.e. they can be easily/automatically restarted without data loss): disable swap.
* If you need a low-latency server or workstation and some of your processes are not killable (e.g. databases): enable swap and set vm.swappiness to 0.
* SSD-backed desktops and other servers and workstations: enable swap and set vm.swappiness to 1 (for NAND flash longevity).
* Disk-backed desktops and other servers and workstations: accept the system/distro defaults, typically swap enabled with vm.swappiness set to 60. You can and likely should lower vm.swappiness to 10 or so if you have a ton of RAM relative to your workload.
* If your server or workstation has a mix of killable and non-killable processes, use oom_score_adj to protect the non-killable processes.
* Monitor systems for swap (page-out) activity.

* vm.swappiness = 0	The kernel will swap only to avoid an out of memory condition, when free memory will be below vm.min_free_kbytes limit.
* vm.swappiness = 1	Minimum amount of swapping without disabling it entirely.
* vm.swappiness = 60	The default value.
* vm.swappiness = 100	The kernel will swap aggressively.




############################################################
# NixOS
############################################################


## TODO Local Binary Caches

[Binary Cache - Sharing]https://nixos.org/nix/manual/#sec-sharing-packages

https://github.com/nh2/nix-binary-cache-proxy
There is also this but doesnt seem like it would work for local packages,
without additional logic in the package.

You can install nix-serve on any machine to share its binary cache (including patched applications). Then add all of the enabled machines to every machine's nix.binaryCaches in order of preference. If they don't have what you need, it will fall back to the upstream server. You'll want to make sure they are upgraded in an appropriate order to minimize the need to leave your network for updates. It's true this isn't well documented, but I figured it out in about a day and was surprised at how simple it turned out to be.

You can even go further and set up your own build server to service all the architectures you need to support.


[Copying Closures Via SSH](https://nixos.org/nix/manual/#ssec-copy-closure)
[Copying Closures Via SSH 2](https://blog.joel.mx/posts/how-to-use-nix-copy-closure-step-by-step)



[Serving a Nix store via SSH](https://nixos.org/nix/manual/#ssec-ssh-substituter)


TODO Fix for ssh connect is to use local agent, since nixos is using local pub keys in auth_keys

https://www.packer.io/docs/templates/communicator.html#ssh_agent_auth

ssh_agent_auth=true
ssh_pty=true


packer build -debug
PACKER_LOG=1 packer build -debug
PACKER_LOG_PATH




Here's another example that is simple, but one I still appreciate: I wanted a slightly newer kernel. How do I get it, and ensure all the "downstream" dependencies are rebuilt (e.g. kernel modules)?[1]

I write this into my configuration.nix:

    boot.kernelPackages = pkgs.linuxPackages_latest;
I run `nixos-rebuild switch && reboot` and I'm done. I can switch back to the last one if I wanted, but this new one takes place immediately. I just did this on a server 20 minutes ago.
There are other small things I can do with this. What if I didn't want to boot this kernel to boot, just test it?

    $ nixos-rebuild build-vm
    $ ./result/bin/run-*-vm
This will instantly drop you into a QEMU-KVM instance that is using NixOS with your `configuration.nix`, but if you rebooted nothing would change. (You can also specify a different configuration.nix to test other machines![2]) Or I could boot it, but just once and switch back pretty easily if something was wrong.



nix-shell to create a namespced env for dev of a project.
can use nix-shell to make the toolchain and dependencies temporarily available to a self-contained shell.
https://github.com/knedlsepp/nix-cheatsheet/tree/master/examples/nix-shell



############################################################
# Fish
############################################################

omf install bobthefish
#> Install Nerd Fonts



shellder
slavic-cat
sushi

https://github.com/ryanoasis/nerd-fonts/releases/tag/v1.2.0
https://github.com/ryanoasis/nerd-fonts/releases/download/v1.2.0/Hack.zip


On MAc:
brew tap caskroom/fonts
brew cask install font-hack-nerd-font


# Only want when SSHing. Cando?
set -g theme_display_user yes


# TODO Add $OMF_CONFIG to vcs

In $OMF_CONFIG create

init.fish - Custom script sourced after shell start
before.init.fish - Custom script sourced before shell start
key_bindings.fish - Custom key bindings where you can use the bind command freely



Must be able to use transformer to make use of vast lib of linux device drivers.  Something like a reverse engineer into new microkern.

One of these approaches directly attacks the core of
the problem: having the entire operating system run as
a single gigantic binary program in kernel mode. Instead,
only a tiny microkernel runs in kernel mode with the
rest of the operating system running as a collection of
fully isolated user-mode server and driver processes.

http://www.minix3.org/docs/jorrit-herder/computer-may06.pdf

Prob ok but what if it was more elegantly solved?
The drivers run in user mode and cannot execute
privileged instructions or read or write the computer’s
I/O ports; they must make kernel calls to obtain these
services. While introducing a small amount of overhead,
this design also enhances reliability
- what if since system is immutable (expect for files, and memory),
  the need for a priveldged proxy like the microkernel is largely reduced,
  and now the driver can make 'priviledged' (but not acrually dangerous) calls.
  ?


Minix 3 performs
IPC by passing fixed-length messages using the rendezvous
principle: When both the sender and the
receiver are ready, the system copies the message directly
from the sender to the receiver.
- very cool means erlang's use is finally being replaced, meaning better perf.
- what other strats could be impld? Most efficient?
- How about if the kernel used the fastest non-locking non-blocking datastructure around? the RB?
- One big system req: If I wanted to change the message passing architecture, I should be able to do it without requiring anyother programs to change.  This can be loosely fullfilled at beggining, bc more abstrcation thought will prob be neccessary.
- Actually scheduling is another concept.  This is just IPC.
The scheduler would schedule threads to run, who would write to this lockfree RB concurrently.  I think the beauty here could be that a thread could be made to exclusively execute a specific company app, and never exec any other code needed by kernel or otherwise.  I guess same thing could be done on linux with pinning, but i bet it just isnt the same. especially perf wise.

Minix 3 elegantly integrates interrupts with the message
passing system. Interrupt handlers use the notifi-
cation mechanism to signal I/O completion. This
mechanism allows a handler to set a bit in the driver’s
‘‘pending interrupts’’ bitmap and then continue without
blocking. When the driver is ready to receive the interrupt,
the kernel turns it into a normal message.


Minix 3’s IPC design does not require message queuing
or buffering, which eliminates the need for buffer
management in the kernel. Furthermore,
since IPC is a powerful construct,
the IPC capabilities of each
server and driver are tightly con-
fined. For each process, the available
IPC primitives, allowed destinations,
and user event notifications are
restricted. User processes, for example,
can use only the rendezvous
principle and can send to only the
Posix servers.

In addition, all kernel data structures are static. All of
these features greatly simplify the code and eliminate
kernel bugs associated with buffer overruns, memory
leaks, untimely interrupts, untrusted kernel code, and
more. Of course, moving most of the operating system
to user mode does not eliminate the inevitable bugs in
drivers and servers, but it renders them far less powerful.
A kernel bug can trash critical data structures, write
garbage to the disk, and so on; a bug in most drivers and
servers cannot do as much damage since these processes
are strongly compartmentalized


Another reliability feature is the use of separate
instruction and data spaces. Should a bug or virus manage
to overrun a driver or server buffer and place foreign
code in data space, the injected code cannot be executed
by jumping to it or having a procedure return to it, since
the kernel will not run code unless it is in the process’s
(read-only) instruction space.
Among the other specific features aimed at improving
reliability, the most crucial is the self-healing property.
If a driver does a store through an invalid pointer, gets
into an infinite loop, or otherwise misbehaves, the reincarnation
server will automatically replace it, often without
affecting running processes.


what if the dev parasignm chagned from writing monolithic apps to tight small functions that are tightly integrated with the OS.

So like a REST route handler for /about could be written in say go or rust or c, then instead of needing all the other stuff, it would be put in a file, and given to the system to serve via its default http server.
- Maybe kinda like googles and amzns SaaS

GO OTHER WAY WITH IT

Want lang to replace OS.  Why use an OS at all, when we have a lang where we tend to place every last possible config.  And really its our domain-specific program that determines the requirements of its OS (where perf is important vs security).  Makes lots of sense so far...

MSFT creates SING# Sigularity

It seems even Rust cant do away with unsafe code? (maybe changes given other reqs) so chaces are we still need pointers and stuff, just that 1. it would be nice if the OS could prevent overflows (even if perf hit requiring a specified flag). 2. I a program does overflow it will be restarted gracefully.  Arg is still there its better to write bug free code.


HOW TO AVOID THE CONTEXT SWITHC.
Key for solution.



Because language safety tightly constrains
the system and user processes, all processes can
run together in a single virtual address space. This design
leads to both safety—because the compiler will not
allow a process to touch another process’s data—and
efficiency—because it eliminates kernel traps and context
switches. 
Singularity design is flexible because
each process is a closed entity and thus can have its own
code, data structures, memory layout,
runtime system, libraries, and
garbage collector. 

- The language (compiler) handles pointer overflows by preventing them from being generated in first place.  code wont compile.