# Mini project for Applied Cloud Computing QTL

## Set up:
1.	Install openstack client (install_openstackcli.sh file)
```bash
./install_openstackcli.sh
```
2.	Install ansible (install_ansible.sh file in QTLaaS map)
    - ./install_ansible.sh
    
3.	Source openrc file (same as in lab 2) 
    -	source <project_name>_openrc.sh
    
3.	Generate keypair with: 
    -	ssh-keygen –t rsa
    
4.	Add keypair to openstack with:
    -	openstack keypair create  --public-key .ssh/id_rsa.pub ansible_key
    
5.	Add the keypair to ansible with: 
    -	ssh-agent bash
    -	ssh-add .ssh/id_rsa
    
6.	go to /etc/ansible/ansible.cfg file and uncomment the host_key_checking=False


## Using it: 

(Make sure to have used source <project_name>_openrc.sh before the following steps)

7.  Get launch_instance_ansible.yaml file and launch a cluster with: 
    - ansible-playbook launch_cluster_ansible.yml --extra-vars "count=2"
    (where count is the size of the cluster and smallest cluster size is 2)
    -	if error try again, if there still is an error remove all lines from .ssh/known_hosts
    
8.  Then run the spark_deployment.yml file in QTLaaS map and you should be able to access QTL as a service from http://<spark_node1 floating ip>:60060

9.  Resize cluster with
    - ansible-playbook launch_cluster_ansible.yml --extra-vars "count=3"
    (can only add nodes so make sure to use right count, if you have a cluster of size 2 and want to add 1 node write count=3)

10.  Delete cluster with: (count is size of cluster)
    ansible-playbook launch_cluster_ansible.yml --extra-vars "count=3 cluster_state=absent" 

