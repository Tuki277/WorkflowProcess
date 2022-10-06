const Content = require('./../models/content');
const WorkflowConfig = require('./../models/workflowConfig');
const data = require('./../dataFake.json');

const postContent = async (req, res, next) => {
    try {

        const newData = {
            content: req.body.content,
            step: JSON.stringify({
                "current": null,
                "nextStep": null,
                "preStep": null
            })
        }

        const newContent = new Content(newData);
        await newContent.save();
        return res.status(201).send();
    } catch (error) {
        return res.status(400).send(error.message);
    }

}

const getContent = async (req, res, next) => {
    try {
        const result = await Content.find({});
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).send(error.message);
    }
}

const postWorkflowConfig = async (req, res, next) => {
    try {
        const newData = new WorkflowConfig(req.body);
        newData.save();
        return res.status(201).send();
    } catch (error) {
        return res.status(400).send(error.message);
    }
}

const getWorkflowConfig = async (req, res, next) => {
    try {
        const result = await WorkflowConfig.find({});
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).send(error.message);
    }
}

const getWorkflowById = (req, res, next) => {
    try {

    } catch (error) {
        return res.status(400).send(error.message);
    }
}

const getContentDetailById = async (req, res, next) => {
    try {
        const findContent = await Content.findById(req.params.id);

        if (!findContent) {
            return res.status(404).send();
        } else {
            const input = findContent.content;
            const content = JSON.parse(input);
            const currentStepBody = JSON.parse(findContent.step);

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

                    findContent.step = JSON.stringify(dataRes);

                    await Content.findByIdAndUpdate(req.params.id, findContent);

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


                            findContent.step = JSON.stringify(dataRes);
                            await Content.findByIdAndUpdate(req.params.id, findContent);

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
    } catch (error) {
        return res.status(400).send(error.message);
    }
}

const filterData = (data, stepProperty, step, type = "", content) => {
    let result = null;
    if (type == "") {
        return data.filter(x => x[stepProperty] == step);
    }
    if (type == "switch") {
        for (let key of Object.keys(content)) {
            eval(`var ${key}`);
            eval(`${key} = '${content[key]}'`);
        };
        data.rules.forEach(item => {
            if
                (eval(String(item.rule))) {
                result = item;
            };
        });
        return result;
    }
}

const updateStepOfContent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userProcess = req.body.userId;
        const result = await Content.findById(id);
        if (result) {
            const step = JSON.parse(result.step);
            if (step.current.length == 1) {
                if (step.current[0].userProcess.find(x => x == userProcess) != undefined) {

                    const dataUpdate = [{
                        ...step.current[0],
                        status: 1
                    }];
    
                    const tempStep = {
                        ...step,
                        current: dataUpdate
                    };
    
                    result.step = JSON.stringify(tempStep);

                    await Content.findByIdAndUpdate(id, result);
                    return res.status(200).send("Ok");
                } else {
                    return res.status(403).send();
                }
            } else {
                const getStepOfMultCurrentProcess = step.current.find(x => x.userProcess == userProcess);
                if (getStepOfMultCurrentProcess != undefined) {

                    const dataUpdate = {
                        ...getStepOfMultCurrentProcess,
                        status: 1
                    };

                    var foundIndex = step.current.findIndex(x => x.userProcess == userProcess);
                    step.current[foundIndex] = dataUpdate;

                    result.step = JSON.stringify(step);

                    await Content.findByIdAndUpdate(id, result);
                    return res.status(200).send("Ok");
                } else {
                    return res.status(403).send();
                }
            }
        } else {
            return res.status(404).send();
        }
    } catch (error) {
        return res.status(400).send(error.message);
    }
}

module.exports = {
    postContent,
    getContent,
    postWorkflowConfig,
    getWorkflowConfig,
    getWorkflowById,
    getContentDetailById,
    updateStepOfContent
}