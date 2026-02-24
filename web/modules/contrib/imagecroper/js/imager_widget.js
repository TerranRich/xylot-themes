(function($, Drupal) {
  Drupal.behaviors.imagerWidget = {
    attach: function(context, settings) {
      var iw_init = true;
      var pluginsConfig = {
        Rotate: {
          controlsCss: {
            width: '15px',
            height: '15px',
            background: 'white',
            border: '1px solid black'
          },
          controlsTouchCss: {
            width: '25px',
            height: '25px',
            background: 'white',
            border: '2px solid black'
          }
        },
        Resize: {
          controlsCss: {
            width: '15px',
            height: '15px',
            background: 'white',
            border: '1px solid black'
          },
          controlsTouchCss: {
            width: '25px',
            height: '25px',
            background: 'white',
            border: '2px solid black'
          }
        },
        Crop: {
          controlsCss: {
            width: '15px',
            height: '15px',
            background: 'white',
            border: '1px solid black'
          },
          controlsTouchCss: {
            width: '25px',
            height: '25px',
            background: 'white',
            border: '2px solid black'
          }
        },
        Toolbar: {
          toolbarSize: 85,
          toolbarSizeTouch: 43,
          tooltipEnabled: true,
          tooltipCss: {
            color: 'white',
            background: 'black'
          }
        },
        Save: {
          upload: true,
          uploadFunction: function(imageId, imageData, callback) {
            $('[data-imager-id="' + imageId + '"]').parents('.image-widget').find('textarea').val(imageData);
            alert('Your edits have been saved. Be sure to click the Save button at the bottom of the page to finish saving this photo.')
          }
        }
      };
      var options = {
        plugins: ['Rotate', 'Crop', 'Resize', 'Save', 'Toolbar', 'Undo'],
        editModeCss: {},
        pluginsConfig: pluginsConfig,
        contentConfig: {
          saveImageData: function(imageId, imageData) {
            try {
              console.log('Save button clicked! ImageId:', imageId);
              console.log('ImageData argument here is the image encoded in base64 string. ' +
                'This function gets called anytime user clicks on `save` button. ' +
                'If one wants to disable edit after saving, check the `standalone-remote-upload.html` ' +
                'example file which shows how to upload image on the server ' +
                'and display it in place of ImagerJs after that.');

              localStorage.setItem('image_' + imageId, imageData);
            } catch (err) {
              console.error(err);
            }
          },
          loadImageData: function(imageId) {
            return true;
          }
        },
        quality: {
          sizes: [
            { label: 'Original', scale: 1, quality: 1, percentage: 100 },
            { label: 'Large', scale: 0.5, quality: 0.5, percentage: 50 },
            { label: 'Medium', scale: 0.2, quality: 0.2, percentage: 20 },
            { label: 'Small', scale: 0.05, quality: 0.05, percentage: 5 }
          ]
        }
      };
      var addNew = function(element) {
        iw_init = true;
        var image_preview_src = element.parents('.image-widget').find('.image-preview img').attr('src');
        if (!image_preview_src) {
          // Media library
          image_preview_src = element.parents("[class*='media-library-add-form'][class*='added-media']").find('[data-drupal-selector="edit-preview"] img').attr('src');
        }
        var image_src_pieces = image_preview_src.split("/public/");

        var base_url = drupalSettings.path.baseUrl;
        let current_lan = drupalSettings.path.currentLanguage;
        if (current_lan.length > 0) {
          let splitbase_url = base_url.split('/');
          if(jQuery.inArray(current_lan, splitbase_url) != -1){
            var image_src = base_url.slice(0,'-' + (current_lan.length + 1)) + '/sites/default/files/' + image_src_pieces[1];
          }else{
            var image_src = base_url + '/sites/default/files/' + image_src_pieces[1];
          }
        } else {
          var image_src = base_url + '/sites/default/files/' + image_src_pieces[1];
        }

        toDataUrl(image_src, function(base64_code) {
          var imagerid = generateUUID();
          var $imageContainer = $(
            '<div class="image-container">' +
            '  <img data-imager-id="' + imagerid + '" class="imager-original" ' +
            '       src="' + base64_code + '" ' +
            '       style="min-width: 300px; min-height: 200px; width: 300px;">' +
            '</div>');
          let this_imager_wrapper = element.parents('.image-widget').find('.imagers');

          if (this_imager_wrapper.find('.image-container').length == 0) {
            this_imager_wrapper.append($imageContainer);

            var imager = new ImagerJs.Imager($imageContainer.find('img.imager-original'), options);
            imager.$imageElement.on('load', function(event) {

              if (iw_init) {

                iw_init = false;
                imager.handleImageElementSrcChanged();
                imager.startEditing = function() {
                  this.log('startEditing()');
                  this.hideOriginalImage();
                  if (!this.$imageElement[0].complete) {
                    throw new Error(Drupal.t('Trying to start editing image that was not yet loaded. Please add `ready` event listener to imager.'));
                  }
                  this.originalPreviewWidth = this.$imageElement.width();
                  this.originalPreviewHeight = this.$imageElement.height();
                  this.$editContainer = $(
                    '<div class="imager-edit-container" tabindex="'+imagerid+'"></div>'
                  );
                  if (this.options.editModeCss) {
                    this.$editContainer.css(this.options.editModeCss);
                  }
                  this_imager_wrapper.find('.image-container').append(this.$editContainer);
                  this._createEditCanvas();
                  this.adjustEditContainer();
                  this.trigger('editStart');
                  this.render();
                  this._isInEditMode = true;
                  this.$editContainer.focus();
                  var sizeInBytes = this.getDataSize();
                  if (sizeInBytes > this.options.imageSizeForPerformanceWarning) {
                    util.setOverlayMessage(
                      this.$editContainer,
                      Drupal.t('Image is too big and could cause very poor performance.'),
                      'default',
                      Drupal.t('Ok'),
                      function() {
                        util.removeOverlayMessage(this.$editContainer);
                      }.bind(this)
                    );
                  }
                  this._adjustElementsSize('toolbar-button',
                    this.touchDevice ?
                    this.options.toolbarButtonSizeTouch :
                    this.options.toolbarButtonSize
                  );
                  // clean up the history
                  if (this.history.length === 0) {
                    this.commitChanges('Original');
                  }
                  this.trigger('historyChange');
                };
                imager.startEditing();
              }
            });
            imager.on('editStart', function() {
              // fix image dimensions so that it could be properly placed on the grid
              imager.$imageElement.css({
                minWidth: 'auto',
                minHeight: 'auto'
              });
            });
          }
        });
      };
      $('.add-new-imager').on('click', function(e) {
        e.preventDefault();
        addNew($(this));
      });

      function toDataUrl(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
          var reader = new FileReader();
          reader.onloadend = function() {
            callback(reader.result);
          }
          reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
      }

      function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;

      }
    }
  };
})(jQuery, Drupal);
