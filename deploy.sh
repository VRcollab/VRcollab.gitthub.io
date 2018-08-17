#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
hugo
git checkout master
mv public /tmp/hugo.vrcollab.com
rm -rf *
git checkout CNAME
mv /tmp/hugo.vrcollab.com/* .
rm -rf /tmp/hugo.vrcollab.com

message="rebuilding site `date`"
if [ $# -eq 1 ]
  then message="$1"
fi
git add .
git commit --allow-empty -m "$message"
git push origin master -f
git checkout src