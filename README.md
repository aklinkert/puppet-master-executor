# clean-docker-hub-images

This repository contains a script / docker image to clean up old tags from docker hub.

## run it
    
    export DOCKER_HUB_USERNAME="myuser"
    export DOCKER_HUB_PASSWORD="mpassword"
    export DOCKER_HUB_ORG="coyoapp"
    docker-compose build
    docker-compose run clean INTERNAL
    
    
## available env vars

`DRY_RUN`: set this var to something !== "" to enable dry run mode
`NODE_ENV`: set this to something other then `production` to enable debug logging
`DOCKER_HUB_USERNAME`: Username to login on docker hub with
`DOCKER_HUB_PASSWORD`: Password to login on docker hub with
`DOCKER_HUB_ORG`: Organisation on docker hub to delete the tags on
