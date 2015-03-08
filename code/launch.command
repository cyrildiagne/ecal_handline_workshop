#!/bin/bash

open http://localhost:8080
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
http-server $DIR -s
