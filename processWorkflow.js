const data  = require('./dataFake.json');

exports.index = (req, res, next) => {
    const input = req.body.content;
    const content = JSON.parse(input);
    const currentStepBody = req.body.step;

    let dataRes = null;
    let currentStep = null;
    let nextStep = null;
    let preStep = null;
    let nextStepTemp = null;
    let preStepTemp = null;
    let currentTemp = null;
    let temp = null;

    try {
        if (currentStepBody.current == null) {
            currentStep = filterData(data, "current", "start");
            nextStepTemp = currentStep[0].next;
            preStep = [];
    
            if (nextStepTemp.length > 1) {
    
            }
            if (nextStepTemp.length == 1) {
                nextStepTemp = nextStepTemp[0];
                nextStep = filterData(data, "current", nextStepTemp);
                temp = nextStep[0].type;
                if (nextStep[0].type == "switch") {
                    while (temp == "switch") {
                        nextStep = filterData(nextStep[0], null, null, nextStep[0].type, content);
                        nextStep = filterData(data, "current", nextStep.next[0]);
                        temp = nextStep[0].type;
                    }
                }
            }
    
            dataRes = {
                current: currentStep,
                preStep: [],
                nextStep
            }
            return res.status(200).json(dataRes);
        }
        else {
    
            if (currentStepBody.current.length == 1) {
                currentTemp = currentStepBody.current[0];
                nextStepTemp = currentStepBody.nextStep[0];
                preStepTemp = currentStepBody.preStep[0];
    
                if (currentTemp.status == 0) {
                    return res.status(200).json(currentStepBody);
                }
    
                else {
                    currentStep = currentStepBody.nextStep;
                    preStep = currentStepBody.current;
                    nextStep = filterData(data, "current", currentStep[0].next[0]);
                    temp = nextStep[0].type;
                    if (temp == "parallel") {
                        let tempParallel = nextStep;
                        var nextStepArr = []
                        tempParallel[0].next.forEach(item => {
                            nextStepArr.push(data.find(x => x.current == item));
                        });
                        nextStep = nextStepArr;
                    }
                    
                    dataRes = {
                        current: currentStep,
                        nextStep,
                        preStep
                    }
    
                    return res.status(200).json(dataRes);
                }
            }
            else {
                currentTemp = currentStepBody.current;
                nextStepTemp = currentStepBody.nextStep[0];
                preStepTemp = currentStepBody.preStep[0];
                for (let i = 0; i < currentTemp.length; i++) {
                    if (currentTemp[i].status == 0) {
                        return res.status(200).json(currentStepBody);
                    }
                }
    
                preStep = currentTemp;
                currentStep = nextStepTemp
                nextStep = filterData(data, "current", currentStep.next[0]);
    
                dataRes = {
                    current: currentStep,
                    nextStep,
                    preStep
                }
    
                return res.status(200).json(dataRes);
            }
        }
    } catch (error) {
        return res.status(400).send(error.message);
    }
}

const filterData = (data, stepProperty, step, type = "", content) => {
    let result = null;
    if (type == "") {
        return data.filter(x => x[stepProperty] == step);
    }
    if (type == "switch") 
    {
        for (let key of Object.keys(content)) {
            eval(`var ${key}`);
            eval(`${key} = '${content[key]}'`);
            var a1 = `${key} || ${content[key]}`;
        };
        data.rules.forEach(item => {
            if (eval(String(item.rule))) {
                 result = item;
            };
        });
        return result;
    }
}