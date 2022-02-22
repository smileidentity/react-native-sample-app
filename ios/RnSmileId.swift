import Smile_Identity_SDK

@objc(RnSmileId)
class RnSmileId: NSObject ,SIDCaptureManagerDelegate ,SIDNetworkRequestDelegate, SIDConsentManagerDelegate {
    func onDocumentVerified(sidResponse: SIDResponse) {
        
    }
    
    func onStartJobStatus() {
        print("onStartJobStatus")
    }
    
    func onEndJobStatus() {
        print("onEndJobStatus")
    }
    
    func onUpdateJobProgress(progress: Int) {
        let params = ["status": "\(progress)"]
        SIDEventEmitter.sharedInstance.dispatch(name: "UploadListener", body: params)
    }
    
    func onUpdateJobStatus(msg: String) {
        print("onUpdateJobStatus \(msg)")
    }
    
    func onAuthenticated(sidResponse: SIDResponse) {
        if let successCallBack = self.resolve {
            if let response = sidResponse.getStatusResponse() {
                let result = convertToDictionary(text: response.getRawJsonString())
                successCallBack(result)
                deassignTempVar()
                return
            }
        }
        
        if let failCallBack =  self.reject {
            failCallBack(currentTag, "onAuthenticated Failed", nil);
            deassignTempVar()
        }
    }
    
    func onEnrolled(sidResponse: SIDResponse) {
        if let successCallBack = self.resolve {
            if let response = sidResponse.getStatusResponse() {
                let result = convertToDictionary(text: response.getRawJsonString())
                successCallBack(result)
                deassignTempVar()
                return
            }
        }
        
        if let failCallBack =  self.reject {
            failCallBack(currentTag, "onEnrolled Failed", nil);
            deassignTempVar()
        }
    }
    
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    func onComplete() {
        let params = ["status": "done"]
        SIDEventEmitter.sharedInstance.dispatch(name: "CompleteListener", body: params)
    }
    
    func onError(sidError: SIDError) {
        do {
            if let failCallBack =  self.reject {
                try  failCallBack(currentTag, sidError.message, sidError);
            }
        } catch {
            
        }
    }
    
    func onIdValidated(idValidationResponse: IDValidationResponse) {
        if let successCallBack = self.resolve {
            let result = convertToDictionary(text: idValidationResponse.getRawJsonString())
            successCallBack(result)
            deassignTempVar()
            return
        }
        
        if let failCallBack =  self.reject {
            failCallBack(currentTag, "onIdValidated Failed", nil);
            deassignTempVar()
        }
    }
    
    var currentTag:String?
    var resolve: RCTPromiseResolveBlock?
    var reject:RCTPromiseRejectBlock?
    let mainIdInfo = ["first_name", "last_name", "middle_name", "country", "id_type", "id_number", "email"]
    let mainPartnerParams = ["user_id", "job_id"]
    
    func onSuccess(tag: String, selfiePreview: UIImage?, idFrontPreview: UIImage?, idBackPreview: UIImage?) {
        if let successCallBack = self.resolve {
            let result = [self.SID_RESULT_TAG: tag, self.SID_RESULT_CODE: -1] as [String : Any]
            successCallBack(result)
            deassignTempVar()
        }
    }
    
    func onError(tag: String, sidError: SIDError) {
        if let failCallBack =  self.reject {
            failCallBack(tag, "An error has occurred", sidError);
            deassignTempVar()
        }
    }
    
    func onDone(tag: String, allowed: Bool) {
        if (allowed) {
            if let successCallBack = self.resolve {
                successCallBack("Consent successfully provided!");
            }
        } else {
            if let failCallBack = self.reject {
                failCallBack(tag, "You did not provide consent...", nil);
            }
        }
        deassignTempVar();
    }
    
    let SID_RESULT_CODE = "SID_RESULT_CODE"
    let SID_RESULT_MESSAGE = "SID_RESULT_MESSAGE"
    let SID_RESULT_TAG = "SID_RESULT_TAG"
    
    @objc(requestConsent:withLogoResName:withLogoBundle:withPartnerName:withPrivacyPolicyUrl:withResolver:withRejecter:)
    func requestConsent(tag: String, logoResName: String, logoBundle: String, partnerName: String, privacyPolicyUrl: String, resolve: @escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let builder = SIDConsentManager.Builder(tag: tag, partnerLogo: logoResName, bundleId: logoBundle, partnerName: partnerName, privacyPolicyUrl: privacyPolicyUrl)
        assignTempVars(tag: tag, resolve:resolve, reject:reject)
        DispatchQueue.main.async {
            builder.setDelegate(delegate: self).build().start()
        }
    }
    
    
    @objc(captureSelfie:withResolver:withRejecter:)
    func captureSelfie(tag: String, resolve: @escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        smileCapture(tag: tag, captureType: CaptureType.SELFIE, resolve:resolve, reject: reject)
    }
    
    @objc(captureIDCard:withResolver:withRejecter:)
    func captureIDCard(tag: String, resolve: @escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        smileCapture(tag: tag, captureType: CaptureType.ID_CAPTURE, resolve:resolve, reject: reject)
    }
    
    
    @objc(getCurrentTags:withRejecter:)
    func getCurrentTags(resolve: @escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
        resolve(["tags":SIFileManager().getIdleTags()])
    }
    
    @objc(getImagesForTag:withResolver:withRejecter:)
    func getImagesForTag(tag: String?,resolve: @escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
        var resultList = [String]()
        let selfiesList = SIFileManager().getSelfies(userTag:tag!)
        let idCardList = SIFileManager().getIDCardImages(userTag: tag!)
        resultList.append(contentsOf: selfiesList)
        resultList.append(contentsOf: idCardList)
        resolve(["images":resultList])
    }
    
    @objc(captureSelfieAndIDCard:withResolver:withRejecter:)
    func captureSelfieAndIDCard(tag: String, resolve: @escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        smileCapture(tag: tag, captureType: CaptureType.SELFIE_AND_ID_CAPTURE, resolve:resolve, reject: reject)
    }
    
    @objc(submitJob:withJobType:withIsProduction:withPartnerParams:withIdInfo:withGeoInfo:withCallBackUrl:withResolver:withRejecter:)
    func submitJob(tag: String, jobType: NSNumber, isProduction: Bool, partnerParams: NSDictionary,  idInfo: NSDictionary,  geoInfo: NSDictionary,callBackUrl: String, resolve:  @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        assignTempVars(tag: tag, resolve:resolve, reject:reject)
        let sidNetworkRequest = SIDNetworkRequest()
        sidNetworkRequest.setDelegate(delegate: self)
        sidNetworkRequest.initialize()
        let sidNetData = SIDNetData(environment: isProduction ? SIDNetData.Environment.PROD : SIDNetData.Environment.TEST);
        
        if (callBackUrl != nil && !callBackUrl.isEmpty) {
            sidNetData.setCallBackUrl(callbackUrl: callBackUrl)
        }
        
        let sidConfig = SIDConfig()
        sidConfig.setSidNetworkRequest(sidNetworkRequest : sidNetworkRequest)
        sidConfig.setSidNetData(sidNetData : sidNetData)
        sidConfig.setRetryOnFailurePolicy(retryOnFailurePolicy: getRetryOnFailurePolicy())
        
        if (idInfo.allKeys.count > 0) {
            let sidIdInfo = SIDUserIdInfo()
            
            for (key, value) in idInfo {
                switch key as! String {
                case "country":
                    sidIdInfo.setCountry(country: value as! String)
                case "id_type":
                    sidIdInfo.setIdType(idType: value as! String)
                case "id_number":
                    sidIdInfo.setIdNumber(idNumber: value as! String)
                case "first_name":
                    sidIdInfo.setFirstName(firstName: value as! String)
                case "middle_name":
                    sidIdInfo.setMiddleName(middleName: value as! String)
                case "last_name":
                    sidIdInfo.setLastName(lastName: value as! String)
                case "email":
                    sidIdInfo.setEmail(email: value as! String)
                default:
                    sidIdInfo.additionalValue(name: key as! String, value: value as! String)
                }
            }
            
            sidConfig.setUserIdInfo(userIdInfo: sidIdInfo)
        }
        
        let sidPartnerParams = PartnerParams()
        
        if (partnerParams.allKeys.count > 0) {
            for (key, value) in partnerParams {
                switch key as! String {
                case "job_id":
                    sidPartnerParams.setJobId(jobId: value as! String)
                case "user_id":
                    sidPartnerParams.setUserId(userId:  value as! String)
                default:
                    sidPartnerParams.setAdditionalValue(key: key as! String, val: value as! String)
                }
            }
        }
        
        sidPartnerParams.setJobType(jobType: jobType.intValue)
        sidConfig.setPartnerParams(partnerParams : sidPartnerParams)
        
        if (geoInfo.allKeys.count > 0) {
            let sidGeoInfo = GeoInfos(latitude: geoInfo.value(forKey: "latitude") as! Double, longitude: geoInfo.value(forKey: "longitude") as! Double, altitude: geoInfo.value(forKey: "altitude") as! Double, accuracy: geoInfo.value(forKey: "accuracy") as! Double, lastUpdate: geoInfo.value(forKey: "lastUpdate") as! String)
        }
        
        let isEnrollMode = jobType == 1 || jobType == 4
        sidConfig.setIsEnrollMode(isEnrollMode: jobType == 1 || jobType == 4)
        
        if (isEnrollMode) {
            let hasIdCard = SIDInfosManager.hasIdCard(userTag: tag)
            sidConfig.setUseIdCard(useIdCard: hasIdCard)
        }
        
        sidConfig.build(userTag: tag)
        
        do {
            try sidConfig.getSidNetworkRequest().submit(sidConfig: sidConfig)
        } catch {
            if let failCallBack =  self.reject {
                failCallBack(tag, "Oops something went wrong", nil);
                deassignTempVar()
            }
        }
    }
    
    func smileCapture(tag: String, captureType: CaptureType, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        assignTempVars(tag: tag, resolve:resolve, reject:reject)
        DispatchQueue.main.async {
            let builder = SIDCaptureManager.Builder(delegate:self, captureType: captureType)
            
            if !tag.isEmpty {
                builder.setTag(tag: tag)
            }
            
            if (captureType == CaptureType.SELFIE_AND_ID_CAPTURE || captureType == CaptureType.ID_CAPTURE) {
                let sidIdCaptureConfig = SIDIDCaptureConfig.Builder().setIdCaptureType(idCaptureType: IDCaptureType.Front).build()
                builder.setSidIdCaptureConfig(sidIdCaptureConfig: sidIdCaptureConfig!)
            }
            
            builder.build().start()
        }
    }
    
    func assignTempVars(tag: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        self.resolve = resolve
        self.reject = reject
        self.currentTag = tag
    }
    
    func deassignTempVar() {
        resolve = nil
        reject = nil
        currentTag = nil
    }
    
    func getRetryOnFailurePolicy() -> RetryOnFailurePolicy {
        let options = RetryOnFailurePolicy();
        options.setMaxRetryTimeoutSec(maxRetryTimeoutSec:15 )
        return options;
    }
    
    func convertToDictionary(text: String) -> [String: Any]? {
        if let data = text.data(using: .utf8) {
            do {
                return try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
            } catch {
                if let failCallBack =  self.reject {
                    failCallBack(currentTag!, "Oops something went wrong", nil);
                    deassignTempVar()
                }
            }
        }
        return nil
    }
}
