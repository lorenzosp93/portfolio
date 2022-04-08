#!/bin/sh
ROOT_DIR=/usr/share/nginx/html

# Replace env vars in JavaScript files
echo "Replacing env constants in ./js"
for file in $ROOT_DIR/js/app.*.js* $ROOT_DIR/index.html;
do
  echo "Processing $file ...";
  echo "Replacing occurrences of 'VUE_APP_BACKEND_URL_value' with ${{VUE_APP_BACKEND_URL}}";
  sed -i 's|VUE_APP_BACKEND_URL_value|'${VUE_APP_BACKEND_URL}'|g' $file 

done

echo "Starting serve on default port"
nginx -g 'daemon off;'