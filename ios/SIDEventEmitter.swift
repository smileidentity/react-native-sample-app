//
//  SIDEventEmitter.swift
//  RnSmileId
//
//  Created by Japhet Ndhlovu on 2021/06/21.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation
class SIDEventEmitter{
    
    /// Shared Instance.
    public static var sharedInstance = SIDEventEmitter()
    
    // ReactNativeEventEmitter is instantiated by React Native with the bridge.
    private static var eventEmitter: SIDReactNativeEventEmitter!
    
    private init() {}
    
    // When React Native instantiates the emitter it is registered here.
    func registerEventEmitter(eventEmitter: SIDReactNativeEventEmitter) {
        SIDEventEmitter.eventEmitter = eventEmitter
    }
    
    func dispatch(name: String, body: Any?) {
        SIDEventEmitter.eventEmitter.sendEvent(withName: name, body: body)
    }
    
    /// All Events which must be support by React Native.
    var allEvents: [String] = {
        var allEventNames: [String] = []
        allEventNames.append("CompleteListener")
        allEventNames.append("UploadListener")
        
        return allEventNames
    }()
    
}
