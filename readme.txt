
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

