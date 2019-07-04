/**********************************************************************
 * Carregar bibliotecas
 *********************************************************************/
const request = require('request');

const gitlabUrl = 'https://gitlab.com';
const gitlabUser = 'lunodrade';
const gitlabToken = '';
const hookUrl = 'https://webhook.site/d0752bc9-b0c5-440a-9c2c-a7f078789b3c';

/**********************************************************************
* Função chamada ao retornar a resposta do request GET* 
*********************************************************************/
var userProjects;
//Configurações do request
urlUser = gitlabUrl+'/api/v4/users/'+gitlabUser+'/projects'
const options = {
    url: urlUser,
    headers: {
        'PRIVATE-TOKEN': gitlabToken
    }
};
//
function callback(error, response, body) {
    //Se não tiver erros e o site retornou reposta válida
    if (!error && response.statusCode == 200) {
        //Tranfosrmar sua resposta em JSON
        userProjects = JSON.parse(body);
        //
        userProjects.forEach(project => {
            checkHooks(project['id']);
            console.log(project['id']);
        });
    }
}
//Chama o request GET do kanban
request(options, callback);    
    
/**********************************************************************
* 
*********************************************************************/
function checkHooks(projectID) {
    var urlProj = gitlabUrl + '/api/v4/projects/' + projectID + '/hooks';
    const optionsCheck = {
        url: urlProj,
        headers: {
            'PRIVATE-TOKEN': gitlabToken
        }
    };
    function callbackCheck(error, response, body) {
        var resp = body;
        if (!error && response.statusCode == 200) {
            //Tranfosrmar sua resposta em JSON
            const body = JSON.parse(resp);
            
            console.log("========================================================");
            var has = false;
            body.forEach(hook => {
                if(hook['url'] == hookUrl) {
                    has = true;
                }
            });

            if(! has) {
                automateAddHook(projectID);
            }
        }
    }
    //Chama o requisição de tarefas
    request(optionsCheck, callbackCheck);
}
/**********************************************************************
* 
*********************************************************************/
function automateAddHook(projectID) {
    //var urlPost = gitlabUrl + '/api/v4/projects/' + projectID + '/hooks';
    var permission = "push_events=true&issues_events=true&confidential_issues_events=true&merge_requests_events=true&tag_push_events=true&note_events=true&job_events=true&pipeline_events=true&wiki_page_events=true&enable_ssl_verification=true";
    var urlPost = gitlabUrl+"/api/v4/projects/"+projectID+"/hooks?private_token="+gitlabToken+"&url="+hookUrl+"&"+permission;

    var data = '{ "request" : "msgaaaaaaaaaaa", "tea": "aaaaaaaaaaaaa", "asfqqqqqqf": "asfeqw" }';
    var json_obj = JSON.parse(data);
    //console.log(json_obj['asfqqqqqqf']);

    request.post({
        headers: {
            'content-type': 'application/json',
            'PRIVATE-TOKEN': gitlabToken
        },
        url: urlPost
    }, function(error, response, body){
        console.log("a " + body, urlPost);
        console.log("========================================================");
    });
}