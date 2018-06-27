# sizingservers.beholder.frontend
*MIT Licensed   
<a href="https://www.sizingservers.be" target="_blank">Sizing Servers Research Lab</a> at <a href="https://www.howest.be" target="_blank">University College of West-Flanders, Department GKG</a>  
Dev: <a href="https://about.me/didjeeh" target="_blank">Dieter Vandroemme</a>*

## Table of contents
1. [Introduction](#introduction)
2. [Version history](#version_history)
3. [Languages, libraries, tools, technologies used and overview](#languages)
4. [Configure](#configure)
5. [Run](#run)
6. [Contribute](#contribute)

<a name="introduction"></a>
## Introduction
![flow](readme_img/flow.png)

![screen-small](readme_img/screen-small.png)

This project is part of a computer hardware inventorization solution, together with sizingservers.beholder.api and sizingservers.beholder.agent.

Agents are installed on the computers you want to inventorize. These communicate with the REST API which stores hardware info. The REST API uses the VMware VSphere SDK to gather hardware info about vhosts as well.

The front-end app visualizes all that info.

<a name="version_history"></a>
## Version history
**2018-06-22** - **version 0.1**: First robust implementation.  
*Compatible with sizingservers.beholder.dnfapi 0.1*

<a name="languages"></a>
## Languages, libraries, tools, technologies used and overview
This is a web application build using **bootstrap 3.3.6** and **JQuery 2.2.3**.

Visual Studio Code 1.24.1 is used to build this app; the minify 0.30.0 extensions to minify html, css and js.

main(.min).js contains all communication to the API using AJAX. It also updates the GUI with retrieved system info every 30 seconds.
    
<a name="configure"></a>    
## Configure

### main(.min).js
    var endpoint = "http://localhost:28751";
    var apiKey = "<insert a SHA-512 of a piece of text here>";
    
Set the endpoint directly in the minified js.

<a name="run"></a>
## Run
Host it on a web server. Add vhosts and run agents on VMs and physical Windows / Linux machines. Hereunder an example of possible output. 

![screen](readme_img/screen.png)

<a name="contribute"></a>
## Contribute
Feel free to post issues and/or fork and submit pull requests. 