import IDVC from "@idscan/idvc";
import "../../node_modules/@idscan/idvc/dist/css/idvc.css";


let idvc = new IDVC({
    el: "videoCapturingEl",
    networkUrl: "/networks",
    licenseKey: "REPLACE ME WITH YOUR LICENSE KEY",
    types: ["ID", "Passport", "PassportCard"],
    showSubmitBtn: true,
    showForceCapturingBtn: false,
    enableLimitation: false,
    autoContinue: true,
    isShowVersion: true,
    resizeUploadedImage: 1500,
    realFaceMode: "all",
    minPDFframes: 1,
    capturingMode: 4,
    onCameraError(err) {
        console.error(err);
    },
    submit(data) {
        console.log('submit event handler is running');
        idvc.showSpinner(true);
        let backStep = data.steps.find((item) => item.type === "back");
        let trackString = null;
        let backImage = null;

        if (backStep) {
            trackString = backStep && backStep.trackString ? backStep.trackString : "";
            backImage = backStep.img.split(/:image\/(jpeg|png);base64,/)[2]
        }


        let request = {
            frontImageBase64: data.steps.find((item) => item.type === "front").img.split(/:image\/(jpeg|png);base64,/)[2],
            backOrSecondImageBase64: backImage,
            faceImageBase64: data.steps.find((item) => item.type === "face").img.split(/:image\/(jpeg|png);base64,/)[2],
            documentType: data.documentType,
            trackString: trackString,
            userAgent: window.navigator.userAgent,
            captureMethod: data.captureMethod,
            verifyFace: true,
        };


        fetch("https://dvs2.idware.net/api/v3/Request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                Authorization: "Bearer ",
            },
            body: JSON.stringify(request),
        })
            .then((response) => response.json())
            .then((response) => {
                fetch(
                    "REPLACE ME WITH YOUR BACKEND SERVICE URL",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json;charset=utf-8",
                        },
                        body: JSON.stringify({
                            requestId: response.requestId,
                        }),
                    }
                )
                    .then((response) => response.json())
                    .then((response) => {
                    
                        document.getElementById("confidence").value = response.documentVerificationResult.totalConfidence;
                        document.getElementById("faceMatch").value = response.faceVerificationResult.confidence;
                        document.getElementById("antiSpoofing").value = response.faceVerificationResult.antiSpoofing;
                        document.getElementById("far").value = response.faceVerificationResult.far;
                    
                        console.log(response);
                        idvc.showSpinner(false);
                    });
            })
            .catch((err) => {
                console.log("Error:", err);    
                idvc.showSpinner(false);
            });
    }
});

