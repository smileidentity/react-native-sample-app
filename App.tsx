import * as React from 'react';

import RNSmileRnLibModule from 'react-native-smile-rn-lib';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  NativeEventEmitter,
  NativeModules,
  Modal,
  Image,
  TextInput,
  ActivityIndicator,
  AsyncStorage,
  Switch,
  Platform,
  ActionSheetIOS,
} from 'react-native';

import {
  Picker
} from '@react-native-picker/picker';

export default function App() {

  const [modalVisible, setModalVisible] = React.useState(false);
  const [icModalVisible, setICModalVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [complete, setComplete] = React.useState(false);

  const [country, setCountry] = React.useState('');
  const [idType, setIdType] = React.useState('');
  const [idNumber, setIdNumber] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [middleName, setMiddleName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [pendingTag, setPendingTag] = React.useState('');
  const countries = ['Cancel', 'GH', 'KE', 'NG', 'ZA'];
  const idTypes = [
    'Cancel',
    'DRIVERS_LICENSE',
    'PASSPORT',
    'SSNIT',
    'VOTER_ID',
    'NATIONAL_ID',
    'ALIEN_CARD',
    'BVN',
    'NIN',
    'NIN_SLIP',
    'TIN',
    'CAC',
  ];

  const [isProduction, setProduction] = React.useState(false);
  const toggleSwitch = () => setProduction((previousState) => !previousState);

  React.useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.SIDReactNativeEventEmitter
    );
    eventEmitter.addListener('CompleteListener', (event) => {
      setComplete(event.status);
    });
    eventEmitter.addListener('UploadListener', (event) => {
      setProgress(event.status);
    });
  }, []);

  const PickerCountry = () => {
    return Platform.OS === 'ios' ? (
      <TouchableOpacity
        onPress={() => {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: countries,
              destructiveButtonIndex: 2,
              cancelButtonIndex: 0,
            },
            (buttonIndex) => {
              switch (buttonIndex) {
                case 0:
                  break;
                default:
                  setCountry(countries[buttonIndex]);
              }
            }
          );
        }}
      >
        <View style={[styles.textContainer]}>
          <Text style={[styles.buttonText]}>
            {country ? 'Selected Country : ' + country : 'Select Country'}
          </Text>
        </View>
      </TouchableOpacity>
    ) : (
      <Picker
        selectedValue={country}
        onValueChange={(itemValue, itemIndex) => setCountry(itemValue)}
      >
        <Picker.Item label="SELECT COUNTRY" value="SELECT" />
        <Picker.Item label="Ghana" value="GH" />
        <Picker.Item label="Kenya" value="KE" />
        <Picker.Item label="Nigeria" value="NG" />
        <Picker.Item label="South Africa" value="ZA" />
      </Picker>
    );
  };

  const PickerIdType = () => {
    return Platform.OS === 'ios' ? (
      <TouchableOpacity
        onPress={() => {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: idTypes,
              destructiveButtonIndex: 2,
              cancelButtonIndex: 0,
            },
            (buttonIndex) => {
              switch (buttonIndex) {
                case 0:
                  break;
                default:
                  setIdType(idTypes[buttonIndex]);
              }
            }
          );
        }}
      >
        <View style={[styles.textContainer]}>
          <Text style={[styles.buttonText]}>
            {idType ? 'Selected ID : ' + idType : 'Select Id Type'}
          </Text>
        </View>
      </TouchableOpacity>
    ) : (
      <Picker
        selectedValue={idType}
        onValueChange={(itemValue, itemIndex) => setIdType(itemValue)}
      >
        <Picker.Item label="SELECT ID TYPE" value="SELECT" />
        <Picker.Item label="Driver's License" value="DRIVERS_LICENSE" />
        <Picker.Item label="Passport" value="PASSPORT" />
        <Picker.Item label="SSNIT" value="SSNIT" />
        <Picker.Item label="Voter ID" value="VOTER_ID" />
        <Picker.Item label="National ID" value="NATIONAL_ID" />
        <Picker.Item label="Alien Card" value="ALIEN_CARD" />
        <Picker.Item label="BVN" value="BVN" />
        <Picker.Item label="NIN" value="NIN" />
        <Picker.Item label="NIN SLIP" value="NIN_SLIP" />
        <Picker.Item label="TIN" value="TIN" />
        <Picker.Item label="CAC" value="CAC" />
      </Picker>
    );
  };

  const modal = () => {
    return (
      <Modal
        style={{ alignItems: 'center', justifyContent: 'center', margin: 40 }}
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <PickerCountry />
        <PickerIdType />

        <TextInput
          style={styles.input}
          onChangeText={setIdNumber}
          value={idNumber}
          placeholder="ID Number"
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          onChangeText={setFirstName}
          value={firstName}
          placeholder="First Name"
          keyboardType="default"
        />

        <TextInput
          style={styles.input}
          onChangeText={setMiddleName}
          value={middleName}
          placeholder="Middle Name"
          keyboardType="default"
        />

        <TextInput
          style={styles.input}
          onChangeText={setLastName}
          value={lastName}
          placeholder="Last Name"
          keyboardType="default"
        />

        <TouchableOpacity
          onPress={async () => {
            setModalVisible(false);
            const idInfo = {
              country: country,
              id_type: idType,
              id_number: idNumber,
              first_name: firstName,
              middle_name: middleName,
              last_name: lastName,
              test_extra: 'test_extra',
            };
            setLoading(true);
            try {
              const result = await RNSmileRnLibModule.submitJob(
                pendingTag,
                1,
                isProduction,
                {},
                idInfo,
                {},
                ""
              );
              await processResponse(result);
              setLoading(false);
            } catch (e) {
              setLoading(false);
              {}   alertDialog(
                'Enrol Failed',
                `Enrol failed with error ${e.errorCode} tag ${e.message}`
              );
            }
          }}
        >
          <View style={[styles.textContainer]}>
            <Text style={[styles.buttonText]}>Submit</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const idCountryModal = () => {
    return (
      <Modal
        style={{ alignItems: 'center', justifyContent: 'center', margin: 40 }}
        animationType="slide"
        transparent={false}
        visible={icModalVisible}
        onRequestClose={() => {
          setICModalVisible(false);
        }}
      >
        <PickerCountry />
        <PickerIdType />

        <TouchableOpacity
          onPress={async () => {
            setICModalVisible(false);
            try {
                verifyDocument();
            } catch (e) {
              setLoading(false);
              alertDialog(
                "Document Verification",
                `${e}`
              );
            }
          }}
        >
          <View style={[styles.textContainer]}>
            <Text style={[styles.buttonText]}>Select</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const savePartnerParams = async (userId, jobId) => {
    try {
      await AsyncStorage.setItem('@SIDReactExample:userId', userId);
      await AsyncStorage.setItem('@SIDReactExample:jobId', jobId);
    } catch (error) {
      // Error saving data
    }
  };

  const getPartnerParams = async () => {
    try {
      const userId = await AsyncStorage.getItem('@SIDReactExample:userId');
      const jobId = await AsyncStorage.getItem('@SIDReactExample:jobId');
      return {
        userId: userId,
        jobId: jobId,
      };
    } catch (error) {
      // Error saving data
    }
    return null;
  };

  const processResponse = async (result) => {
    console.log(result);
    if (result.job_success) {
      if (result.result.ResultCode && result.result.ResultText) {
        alertDialog(
          'Job Success',
          `Response with result code ${result.result.ResultCode} and result text ${result.result.ResultText}`
        );
        await savePartnerParams(
          result.result.PartnerParams.user_id,
          result.result.PartnerParams.job_id
        );
      }
    } else {
      if (result.result.ResultCode && result.result.ResultText) {
        alertDialog(
          'Job failed',
          `Response with result code ${result.result.ResultCode} and result text ${result.result.ResultText}`
        );
      }
    }
  };

  const alertDialog = (title, message) => {
    Alert.alert(title, message, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ]);
  };

  const verifyDocument = async () => {

    const capture_prompt_style = {
      text_size: 12,
      color: "blue_color",
      font_style: "bold"
    };

    const capture_tip_style = {
      text_size: 14,
      color: "green_color",
      font_style: "italic"
    };
    
    const config = {
      overlay_color: "red_color",
      overlay_alpha: 100,
      overlay_thickness: 10,
      overlay_dotted: true,
      capturing_progress_color: "yellow_color",
      captured_progress_color: "green_color",
      android_is_capture_fullscreen: true,
      prompt_default_text: "prompt_default_text",
      prompt_blurry_text: "prompt_blurry_text",
      prompt_capturing_text: "prompt_capturing_text",
      prompt_do_smile_text: "prompt_do_smile_text",
      prompt_compatibility_mode_text: "prompt_compatibility_mode_text",
      prompt_face_not_found_text: "prompt_face_not_found_text",
      prompt_face_too_close_text: "prompt_face_too_close_text",
      prompt_idle_text: "prompt_idle_text",
      prompt_move_closer_text: "prompt_move_closer_text",
      prompt_too_dark_text: "prompt_too_dark_text",
      capture_tip_text: "capture_tip_text",
      capture_title_text: "capture_title_text",
      android_capture_tip_style: "android_capture_tip_style",
      capture_prompt_style: capture_prompt_style,
      capture_tip_style: capture_tip_style
    };

    const data = await RNSmileRnLibModule.captureSelfieAndIDCard('', config);
    setLoading(true);
    const resultCode = data.SID_RESULT_CODE;
    const resultTag = data.SID_RESULT_TAG;
    
    const idInfo = {
      country: country,
      id_type: idType
    };

    if (resultCode === -1) {
      const result = await RNSmileRnLibModule.submitJob(
        resultTag,
        6,
        isProduction,
        {},
        idInfo,
        {},
        ""
      );

      await processResponse(result);
      setLoading(false);
      return;
    }
    setLoading(false);
    alertDialog(
      "Document Verification",
      `Failed enroll with error ${resultCode} tag ${resultTag}`
    );
  }

  const consentDialog = () => RNSmileRnLibModule.requestConsent("USER_ID_001", "ic_mushroom", "com.example.rnsmileid", "SID-Arlon", "www.google.com");

  return (
    <View style={styles.container}>
      {modal()}
      {idCountryModal()}
      {loading && <Text style={styles.textStyle}>Progress : {progress}</Text>}
      {loading && <ActivityIndicator size="large" color="#00ff00" />}
      {!loading && (
        <View>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[styles.buttonText, { color: '#00f' }]}>
              Current Environment : {isProduction ? 'Production' : 'Test'}
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isProduction ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isProduction}
            />
          </View>
          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={async () => {
              try {
                const screen_title_style = {
                  text_size: 16,
                  text_color: "#0ea5de", //blue_color
                  font_style: "bold"
                };

                const capture_prompt_style = {
                  text_size: 12,
                  text_color: "#0ea5de", //blue_color
                  font_style: "bold"
                };

                const capture_tip_style = {
                  text_size: 14,
                  text_color: "#00FF00", //green_color
                  font_style: "italic"
                };

                const review_prompt_style = {
                  text_size: 16,
                  text_color: "#0ea5de", //blue_color
                  font_style: "bold"
                };

                const review_tip_style = {
                  text_size: 8,
                  text_color: "#00FF00", //green_color
                  font_style: "italic"
                };

                const review_confirm_style = {
                  text_size: 12,
                  text_color: "#00FF00",
                  font_style: "italic",
                  width: 240,
                  height: 84
                };

                const review_retake_style = {
                  text_size: 12,
                  text_color: "#FF0000",
                  font_style: "normal",
                  width: 360,
                  height: 72
                };
                
                const config = {
                  screen_title_style: screen_title_style,
                  is_fullscreen: false,
                  capture_title_text: "capture_title_text",

                  overlay_color: "yellow_color", //red_color
                  overlay_alpha: 100,
                  overlay_thickness: 10,
                  overlay_dotted: true,
                  overlay_width: 260,
                  overlay_height: 350,

                  capturing_progress_color: "red_color", //yellow_color
                  captured_progress_color: "green_color", //green_color

                  prompt_default_text: "Smile for the camera",
                  prompt_blurry_text: "prompt_blurry_text",
                  prompt_capturing_text: "prompt_capturing_text",
                  prompt_do_smile_text: "prompt_do_smile_text",
                  prompt_compatibility_mode_text: "prompt_compatibility_mode_text",
                  prompt_face_not_found_text: "prompt_face_not_found_text",
                  prompt_face_too_close_text: "prompt_face_too_close_text",
                  prompt_idle_text: "prompt_idle_text",
                  prompt_move_closer_text: "prompt_move_closer_text",
                  prompt_too_dark_text: "prompt_too_dark_text",

                  capture_prompt_style: capture_prompt_style,

                  capture_tip_text: "capture_tip_text",
                  capture_tip_style: capture_tip_style,

                  review_title_text: "review_title_text",

                  review_prompt_text: "review_prompt_text",
                  review_prompt_style: review_prompt_style,

                  review_tip_text: "review_tip_text",
                  review_tip_style: review_tip_style,

                  review_confirm_text: "review_confirm_text",
                  review_confirm_color: "#0ea5de", //blue_color
                  review_confirm_style: review_confirm_style,

                  review_retake_text: "review_retake_text",
                  review_retake_color: "#00FF00", //green_color
                  review_retake_style: review_retake_style
                };
                const data = await RNSmileRnLibModule.captureSelfie('', config);
                const resultCode = data.SID_RESULT_CODE;
                const resultTag = data.SID_RESULT_TAG;
                if (resultCode === -1) {
                  alertDialog(
                    'Selfie Capture Success',
                    `Successfully captured selfie with tag ${resultTag}`
                  );
                  return;
                }
                alertDialog(
                  'Selfie Capture Failed',
                  `Failed selfie capture with error ${resultCode} tag ${resultTag}`
                );
              } catch (e) {
                alertDialog(
                  'Selfie Capture Failed',
                  `Failed selfie capture with error`
                );
              }
            }}
          >
            <View style={[styles.textContainer]}>
              <Text style={[styles.buttonText]}>Selfie Test</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              let dlgHeader = "User Consent";
              try {
                dlgHeader = "ID Capture";
                const data = await RNSmileRnLibModule.captureIDCard('', {});
                const resultCode = data.SID_RESULT_CODE;
                const resultTag = data.SID_RESULT_TAG;
                if (resultCode === -1) {
                  alertDialog(
                  `${dlgHeader}`,
                    `Successfully captured id card with tag ${resultTag}`
                  );
                  return;
                }
                setLoading(false);
                alertDialog(
                  `${dlgHeader}`,
                  `Failed id card capture with error ${resultCode} tag ${resultTag}`
                );
              } catch (e) {
                setLoading(false);
                alertDialog(
                  `${dlgHeader}`,
                  `${e}`
                );
              }
            }}
          >
            <View style={[styles.textContainer]}>
              <Text style={[styles.buttonText]}>ID Card Test</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              let dlgHeader = "User Consent";
              try {
                dlgHeader = "Selfie And ID Capture Failed";
                const data = await RNSmileRnLibModule.captureSelfieAndIDCard('', {});
                const resultCode = data.SID_RESULT_CODE;
                const resultTag = data.SID_RESULT_TAG;
                if (resultCode === -1) {
                  alertDialog(
                    'ID and Selfie Capture Success',
                    `Successfully captured selfie and id card with tag ${resultTag}`
                  );
                  return;
                }
                setLoading(false);
                alertDialog(
                  'Selfie And ID Capture Failed',
                  `Failed selfie and id card capture with error ${resultCode} tag ${resultTag}`
                );
              } catch (e) {
                setLoading(false);
                alertDialog(
                  `${dlgHeader}`,
                  `${e}`
                );
              }
            }}
          >
            <View style={[styles.textContainer]}>
              <Text style={[styles.buttonText]}>Selfie and ID Card Test</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              try {
                const data = await RNSmileRnLibModule.captureSelfie('', {});
                const resultCode = data.SID_RESULT_CODE;
                const resultTag = data.SID_RESULT_TAG;
                if (resultCode === -1) {
                  setLoading(true);
                  const result = await RNSmileRnLibModule.submitJob(
                    resultTag,
                    4,
                    isProduction,
                    {},
                    {},
                    {},
                    ""
                  );
                  await processResponse(result);
                  setLoading(false);
                  return;
                }
                setLoading(false);
                alertDialog(
                  'Enroll Failed',
                  `Failed enroll with error ${resultCode} tag ${resultTag}`
                );
              } catch (e) {
                setLoading(false);
                alertDialog(
                  'Enroll Failed',
                  `Failed enroll with unexpected error`
                );
              }
            }}
          >
            <View style={[styles.textContainer]}>
              <Text style={[styles.buttonText]}>Enroll</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              let dlgHeader = "User Consent";
              try {
                dlgHeader = "Enroll Failed";
                const data = await RNSmileRnLibModule.captureSelfieAndIDCard('', {});
                const resultCode = data.SID_RESULT_CODE;
                const resultTag = data.SID_RESULT_TAG;
                if (resultCode === -1) {
                  setLoading(true);
                  const result = await RNSmileRnLibModule.submitJob(
                    resultTag,
                    1,
                    isProduction,
                    {},
                    {},
                    {},
                    ""
                  );

                  await processResponse(result);
                  setLoading(false);
                  return;
                }
                setLoading(false);
                alertDialog(
                  `${dlgHeader}`,
                  `Failed enroll with error ${resultCode} tag ${resultTag}`
                );
              } catch (e) {
                setLoading(false);
                alertDialog(
                  `${dlgHeader}`,
                  `${e}`
                );
              }
            }}
          >
            <View style={[styles.textContainer]}>
              <Text style={[styles.buttonText]}>Enroll with ID Card</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              let dlgHeader = "User Consent";
              try {
                await consentDialog();
                dlgHeader = "Enroll Failed";
                const data = await RNSmileRnLibModule.captureSelfie('', {});
                const resultCode = data.SID_RESULT_CODE;
                const resultTag = data.SID_RESULT_TAG;
                if (resultCode === -1) {
                  setPendingTag(resultTag);
                  setModalVisible(true);
                  return;
                }
                setLoading(false);
                alertDialog(
                  `${dlgHeader}`,
                  `Failed enroll with error ${resultCode} tag ${resultTag}`
                );
              } catch (e) {
                setLoading(false);
                alertDialog(
                  `${dlgHeader}`,
                  `${e}`
                );
              }
            }}
          >
            <View style={[styles.textContainer]}>
              <Text style={[styles.buttonText]}>Enroll with ID Number</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              const partnerParams = await getPartnerParams();
              if (partnerParams === null) {
                alertDialog(
                  'Please Enroll First',
                  `Please enrol first before authentication`
                );
                return;
              }

              try {
                const data = await RNSmileRnLibModule.captureSelfie('', {});
                const resultCode = data.SID_RESULT_CODE;
                const resultTag = data.SID_RESULT_TAG;
                if (resultCode === -1) {
                  setLoading(true);
                  try {
                    const result = await RNSmileRnLibModule.submitJob(
                      resultTag,
                      2,
                      isProduction,
                      {
                        user_id: partnerParams.userId,
                      },
                      {},
                      {},
                      ""
                    );
                    await processResponse(result);
                    setLoading(false);
                  } catch (e) {
                    setLoading(false);
                    alertDialog('Auth Failed', `Auth Failed`);
                  }
                  return;
                }
                setLoading(false);
                alertDialog(
                  'Selfie Capture Failed',
                  `Failed selfie capture with error ${resultCode} tag ${resultTag}`
                );
              } catch (e) {
                setLoading(false);
                alertDialog(
                  'Selfie Capture Failed',
                  `Failed selfie capture with error`
                );
              }
            }}
          >
            <View style={[styles.textContainer]}>
              <Text style={[styles.buttonText]}>Authenticate</Text>
            </View>
          </TouchableOpacity>


          <TouchableOpacity
            onPress={async () => {
              try {
                // const result = await RNSmileRnLibModule.getCurrentTags();
                // console.log("SMILEID TAGS START");
                // console.log(result.tags);
                // console.log("SMILEID TAGS END");

                const result = await RNSmileRnLibModule.testFun2();

                // const result2 = await RNSmileRnLibModule.getImagesForTag("USER_TAG_02_04_09_42_32");
                // console.log("SMILEID TAGS START");
                // console.log(result2);
                // console.log("SMILEID TAGS END");
              } catch(e: Exception) {
                alertDialog(
                  "File Paths",
                  `${e}`
                );
              }
            }}
          >
            <View style={[styles.textContainer]}>
              <Text style={[styles.buttonText]}>File Paths Test</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              try {
                await consentDialog();
              } catch (e) {
                setLoading(false);
                alertDialog(
                  "User Consent",
                  `${e}`
                );
                return;
              }
              setICModalVisible(true);
            }}
          >
            <View style={[styles.textContainer]}>
              <Text style={[styles.buttonText]}>Document Verification</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  textContainer: {
    marginTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#0A92D4',
    alignItems: 'center',
    borderRadius: 16
  },
  buttonText: {
    color: '#fff',
  },
  input: {
    marginTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
});