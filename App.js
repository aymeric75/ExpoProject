import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
import ImageColors from 'react-native-image-colors'




function hexColorDelta(hex1, hex2) {


  // get red/green/blue int values of hex1
  var r1 = parseInt(hex1.substring(0, 2), 16);
  var g1 = parseInt(hex1.substring(2, 4), 16);
  var b1 = parseInt(hex1.substring(4, 6), 16);
  // get red/green/blue int values of hex2
  var r2 = parseInt(hex2.substring(0, 2), 16);
  var g2 = parseInt(hex2.substring(2, 4), 16);
  var b2 = parseInt(hex2.substring(4, 6), 16);
  // calculate differences between reds, greens and blues
  var r = 255 - Math.abs(r1 - r2);
  var g = 255 - Math.abs(g1 - g2);
  var b = 255 - Math.abs(b1 - b2);
  // limit differences between 0 and 1
  r /= 255;
  g /= 255;
  b /= 255;
  // 0 means opposite colors, 1 means same colors
  return (r + g + b) / 3;

}


export default function ImagePickerExample() {

  const [image, setImage] = useState(null);

  const [imageHeight, setimageHeight] = useState(null);

  const [imageWidth, setImageimageWidth] = useState(null);

  const [imageAverageColor, setImageAverageColor] = useState(null);

  const [images, setImages] = useState(null);

  const [imageData, setImageData] = useState(null);


  // pick One Image
  const pickImage = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {

      // Set the State URI of the single image
      setImage({uri: result["assets"][0].uri});
     
    
      let downsize_factor = 1.;

      // Max width should be 500, so we determine a downsizing factor
      if (result["assets"][0].width > 130) {
        downsize_factor  = result["assets"][0].width/130;
      }

      // newWidth = adapted with the downsize_factor
      // newHeight will be determined automatically by manipulateAsync
      let newWidth = Math.floor(result["assets"][0].width/downsize_factor);



      // retrieve Resized version of the refImage
      let manipResult = await manipulateAsync(
        result["assets"][0].uri,
        [{ resize: {width: newWidth} }],
        { format: "jpeg" }
      );

      // retrieve Mean Color of Resized refImage
      let resultColor = await ImageColors.getColors(manipResult.uri, {
        fallback: '#228B22',
        cache: false,
        key: 'unique_key',
      });

          
      // set the States of the refImage
      setImageAverageColor(resultColor.average.substring(1));
      setImageimageWidth(manipResult.width);
      setimageHeight(manipResult.height);
     
    }

  };

  // Pick multiple Images
  const pickImages = async () => {
 
    // retrieve all Compared Images
    let results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true
    });



    // results

    let final_images = [];
    // If only 1 image has been picked up, re-format the "results" object
   

    // Init an array of promises (we run the computations in parallel!)
    let arrayOfPromises = [];

    const t0 = performance.now();


    // If there are picked images && refImage was set
    if (!results.canceled && image) {
      

      // loop over selected images
      for (let i = 0, len = results["assets"].length; i < len; i++) {


        // iterated image
        let element = results["assets"][i];

        // construct a Promise for all the computations between
        // currentImage && refImage
        async function returnTotalPromise() {

          // return the resized version
          let manipResultBisTmp = await manipulateAsync(
            element.uri,
            [{ resize: {width: imageWidth, height: imageHeight} }],
            { format: "jpeg" }
          );

          // Compute the color of currentImg
          const resultColorBis = await ImageColors.getColors(manipResultBisTmp.uri, {
            fallback: '#228B22',
            cache: false,
            key: 'unique_key',
          });
          // similarity of color between refImage && currentImage
          const diff_avg_color = hexColorDelta(imageAverageColor, resultColorBis.average.substring(1))
      

          const criteria = diff_avg_color;

          return criteria;
        }

        arrayOfPromises.push(returnTotalPromise());
      }

    }

    PromisesResult = await Promise.all(arrayOfPromises);
    
    end_array = [];

    for (let i = 0, len = PromisesResult.length; i < len; i++) {
      if(PromisesResult[i] > 0.99) {
        end_array.push(results["assets"][i]);
      }
    }
    
    setImages(end_array);
  };

  return (


    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Button title="Pick image from camera roll" onPress={pickImage} />
        {image && <Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />}
      </View>

      <View style={{ flex: 1, backgroundColor: "yellow" }}>

        <Button title="Pick images from camera roll" onPress={pickImages} />

        { images &&
          <FlatList 
            horizontal={false} 
            showsHorizontalScrollIndicator={false}
            data={images}
            renderItem={({ item, index }) => (
                <Image 
                    source={{ uri: item.uri }}
                    key={index}
                    style={{
                        width:100,
                        height:100,
                    }}
                />
            )}
        />
        }

      </View>

  </View>

    
  );
}
