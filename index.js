/**********************************************************************
 * Carregar bibliotecas
 *********************************************************************/
const request = require('request');
const Config = require('./config.json');

const gitlabUrl = Config['gitlabUrl']; //or http://gitlab.com
const gitlabUser = Config['gitlabUser'];
const gitlabToken = Config['gitlabToken'];
const hookUrl = Config['hookUrl'];

const doUserProjects = Config['doUserProjects']; //self projects
const doUserGroups = Config['doUserGroups']; //Only owner gitlab (gitlab self hosted)

/**********************************************************************
 *   → para usuário
 *********************************************************************/
function updateUserProjects() {
  //Configurações do request
  urlUser = gitlabUrl + '/api/v4/users/' + gitlabUser + '/projects';
  const optionsUserProjects = {
    url: urlUser,
    headers: {
      'PRIVATE-TOKEN': gitlabToken
    }
  };
  //
  function callbackUserProjects(error, response, body) {
    //Se não tiver erros e o site retornou reposta válida
    if (!error && response.statusCode == 200) {
      //Tranfosrmar sua resposta em JSON
      var json = JSON.parse(body);
      //
      json.forEach(project => {
        checkHooks(project['id']);
        console.log(project['id']);
      });
    }
  }
  //Chama o request GET do kanban
  request(optionsUserProjects, callbackUserProjects);
}
if (doUserProjects) {
  updateUserProjects();
}
/**********************************************************************
 *   → para grupos
 *********************************************************************/
function updateUserGroups() {
  var userGroupsID = [];
  //Configurações do request
  urlGroups = gitlabUrl + '/api/v4/groups';

  const optionsUserGroups = {
    url: urlGroups,
    headers: {
      'PRIVATE-TOKEN': gitlabToken
    }
  };
  //
  function callbackUserGroups(error, response, body) {
    //Se não tiver erros e o site retornou reposta válida
    if (!error && response.statusCode == 200) {
      //Tranfosrmar sua resposta em JSON
      var json = JSON.parse(body);

      json.forEach(group => {
        //if(group['visibility'] == 'private') {
        var projId = group['id'];
        userGroupsID.push(projId);
        //}
        //TODO: LER DO SUBGRUPO TAMBÉM
      });

      console.log('\n\n');
      console.log('GRUPOS → ' + userGroupsID);

      userGroupsID.forEach(groupID => {
        checkProjects(groupID);
      });

      console.log('\n');
    }
  }
  //Chama o request GET do kanban
  request(optionsUserGroups, callbackUserGroups);
}
if (doUserGroups) {
  updateUserGroups();
}
/**********************************************************************
 *
 *********************************************************************/
function checkProjects(groupID) {
  var userProjectsID = [];
  //Configurações do request
  urlProject = gitlabUrl + '/api/v4/groups/' + groupID;

  const optionsProjects = {
    url: urlProject,
    headers: {
      'PRIVATE-TOKEN': gitlabToken
    }
  };
  //
  function callbackProjects(error, response, body) {
    //Se não tiver erros e o site retornou reposta válida
    if (!error && response.statusCode == 200) {
      //Tranfosrmar sua resposta em JSON
      var json = JSON.parse(body);

      json['projects'].forEach(project => {
        var projId = project['id'];
        userProjectsID.push(projId);
      });

      console.log('PROJETOS → ' + userProjectsID);

      userProjectsID.forEach(projectID => {
        //projectid
        checkHooks(projectID);
      });
    }
  }
  //Chama o request GET do kanban
  request(optionsProjects, callbackProjects);
}

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

      var has = false;
      body.forEach(hook => {
        if (hook['url'] == hookUrl) {
          has = true;
        }
      });

      if (!has) {
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
  var permission =
    'push_events=true&issues_events=true&confidential_issues_events=true&merge_requests_events=true&tag_push_events=true&note_events=true&job_events=true&pipeline_events=true&wiki_page_events=true&enable_ssl_verification=true';
  var urlPost =
    gitlabUrl +
    '/api/v4/projects/' +
    projectID +
    '/hooks?private_token=' +
    gitlabToken +
    '&url=' +
    hookUrl +
    '&' +
    permission;

  var data = '{ "request" : "msgaaaaaaaaaaa" }';
  var json_obj = JSON.parse(data);
  //console.log(json_obj['asfqqqqqqf']);

  request.post(
    {
      headers: {
        'content-type': 'application/json',
        'PRIVATE-TOKEN': gitlabToken
      },
      url: urlPost
    },
    function(error, response, body) {
      console.log('a ' + body, urlPost);
      console.log('===========================');
    }
  );
}
