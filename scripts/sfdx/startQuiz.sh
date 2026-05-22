#!/bin/bash

sfdx project deploy start --metadata-dir=guest-profile-metadata -w 50
sfdx force:user:permset:assign -n quiz
sfdx community publish -n Quiz
sfdx force:data:tree:import -p ./data/sales-0.json
sfdx force:data:tree:import -p ./data/service-0.json
sfdx project reset tracking -p
sfdx force:org:open
