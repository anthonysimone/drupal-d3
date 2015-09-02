<?php

/**
 * Automates the addition of all theme javascript and css.
 * This function relies on two global $conf variables which are explained below, $conf['minify_js'] and $conf['minify_js'].
 * Both of these variables determine if the minified version of the assets should be used or not.
 * It will not minify anything so it assumes there is a minified file at the specified path.
 *
 * @param $js_path - The path to the directory containing all theme js.
 * @param $css_path - The path to the directory containing all theme css.
 * @param $options - An array of options.
 *    js_filename - The name for the minified javascript file.
 *    css_filename - The name of the minified css file.
 */
function themekit_add_assets($js_path, $css_path, $options = array('js_filename' => 'theme.js', 'js_filename_min' => 'theme.min.js', 'css_filename' => 'style.css')) {
  // Link to the minified or unminified js file.
  $js_path .= 'dist';
  if (variable_get('minify_js')) {
    drupal_add_js($js_path . '/' . $options['js_filename_min'], array('group' => JS_THEME));
  } else {
    drupal_add_js($js_path . '/' . $options['js_filename'], array('group' => JS_THEME));
  }

  // Link to the minified or unminified style.css
  if (variable_get('minify_css')) {
    $css_path .= 'dist';
  } else {
    $css_path .= 'src';
  }

  drupal_add_css($css_path . '/' . $options['css_filename']);
}
