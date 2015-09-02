docroot=docroot
theme_name=themekit

install: drush-make install-profile

init: git get-profile deploykit themekit

init-vlad: vlad local-settings
	mv vlad-settings.inc $(docroot)/sites/default/vlad-settings.inc

install-vlad:
	- cd vlad && vagrant up

drush-make:
	- cd $(docroot) && drush make -y --no-core profiles/e3_profile/e3_profile.make

install-profile: local-settings
	- cd $(docroot) && drush si -y e3_profile

local-settings:
	mv default.settings.php $(docroot)/sites/default/settings.php
	mv local-settings.inc $(docroot)/sites/default/local-settings.inc

git:
	rm README.md
	rm -rf .git
	git init

get-profile: drupal
	git clone --quiet --depth 1 git@github.com:elevatedthird/e3_profile.git $(docroot)/profiles/e3_profile
	rm -rf $(docroot)/profiles/e3_profile/.git
	cd $(docroot)/sites/all/modules && mkdir contrib custom dev patched features

vlad:
	git submodule --quiet add git@github.com:hashbangcode/vlad.git vlad

themekit: drupal zen
	git clone --quiet --depth 1 git@github.com:elevatedthird/themekit.git $(docroot)/sites/all/themes/$(theme_name)
	rm -rf $(docroot)/sites/all/themes/$(theme_name)/.git

zen:
	- drush dl zen --destination=$(docroot)/sites/all/themes/

drupal:
	- drush dl drupal --drupal-project-rename=$(docroot)
	rm $(docroot)/.gitignore

deploykit:
	git submodule --quiet add git@github.com:elevatedthird/deploykit.git deploykit
	cp deploykit/hosts.example settings/hosts
	cp deploykit/dev.yml.example settings/dev.yml
	cp deploykit/stg.yml.example settings/stg.yml
	cp deploykit/prd.yml.example settings/prd.yml
