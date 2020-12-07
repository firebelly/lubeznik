from fabric.api import *
import os

env.hosts = ['firebelly.webfactional.com']
env.user = 'firebelly'
env.remotepath = '/home/firebelly/webapps/lubeznik_staging'
env.git_branch = 'master'
env.forward_agent = True
env.warn_only = True

def production():
  env.hosts = ['lubeznikcenter.opalstacked.com']
  env.user = 'lubeznik'
  env.git_branch = 'master'
  env.remotepath = '/home/lubeznik/apps/lubeznik_production'

# def syncstaging():
#   with cd(env.remotepath):
#     run('/usr/bin/mysqldump --defaults-extra-file=/home/firebelly/etc/.my.cnf -u fb_craft_sql fb_craftstarter | /usr/bin/mysql --defaults-extra-file=/home/firebelly/etc/.my.cnf -u fb_craft_sql fb_craftstarter_dev')
#     run('/usr/bin/rsync -av --delete /home/firebelly/webapps/fb_craftstarter/web/uploads/ /home/firebelly/webapps/fb_craftstarter_dev/web/uploads/')

# If pulling a fresh clone of a project already in progress, run fab devsetup to composer/yarn install
def devsetup():
  print "Composing and yarning...\n"
  local('composer install')
  local('yarn')
  local('test -f .env || cp .env.example .env')
  print "OK DONE! Hello? Are you still awake?\nEdit your .env file with local credentials\nRun `yarn start` to compile & watch assets"

def deploy(composer='y', assets='y'):
  update()
  if composer == 'y':
    composer_install()
  # build and sync production assets
  if assets != 'n':
    local('rm -rf web/assets/dist')
    local('yarn build:production')
    run('mkdir -p ' + env.remotepath + '/web/assets/dist')
    put('web/assets/dist', env.remotepath + '/web/assets/')

def update():
  with cd(env.remotepath):
    run('git pull origin {0}'.format(env.git_branch))

def composer_install():
  with cd(env.remotepath):
    run('~/bin/composer install')
