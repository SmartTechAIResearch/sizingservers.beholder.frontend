# sizingservers.beholder.frontend
    2017 Sizing Servers Lab  
    University College of West-Flanders, Department GKG


![flow](readme_img/flow.png)

![screen](readme_img/screen.png)

This project is part of a computer hardware inventorization solution, together with sizingservers.beholder.api and sizingservers.beholder.agent.

Agents are installed on the computers you want to inventorize. These communicate with the REST API which stores hardware info. The front-end app visualizes that info.

## Languages, libraries, tools, technologies used and overview
This is a web application build using html, bootstrap and JQuery.

Visual Studio Code 1.13.0 is used to build this app; the minify 0.30.0 extensions to minify html, css and js.

main(.min).js contains all communication to the API using AJAX. It also updates the GUI with retrieved SystemInformations every 30 seconds.
    
## Configure

### main(.min).js
    endpoint="http://localhost:5000/api/list?apiKey=<insert a SHA-512 of a piece of text here>"
    
Set the endpoint directly in the minified js and the unminified version as well, because that is a clean way of working.

## Run
Host it on a web server.