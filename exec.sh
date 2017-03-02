#!/bin/bash
echo "# FindTeamMate" >> README.md
git init
git add README.md
git commit -m "first commit"
git remote add origin https://github.com/nip572/FindTeamMate.git
git push -u origin master
