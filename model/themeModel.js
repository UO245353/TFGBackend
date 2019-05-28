'use strict';

module.exports = app => {

  const connection = app.dbLib.createConnection();

  const themeSchema = require('./model-schemas/themeSchema')(app);
  const questionSchema = require('./model-schemas/questionSchema')(app);
  const sectionSchema = require('./model-schemas/sectionSchema')(app);

  const theme = connection.model('theme', themeSchema);
  const question = connection.model('question', questionSchema);
  const section = connection.model('section', sectionSchema);

  const Promise = app.promise;

  const _ = app._;

  const ERROR = {
    UNKNOWN: '00',
    NOT_FOUND: '01',
    CONFLICT: '02'
  };

  theme.ERROR = ERROR;

  theme.isThemeError = error => {

    return _.find(Object.values(ERROR), code => {
      if(code === error){

        return code;
      }
    }) || false;
  };

  theme.get = (filter, projections) => {

    return Promise.resolve()
    .then(() => theme.find(filter, projections).exec() )
    .then( themeList => {

      if(!themeList){

        throw ERROR.UNKNOWN;
      }

      return themeList;
    });
  };

  theme.getOne = (filter, projections) => {

    return Promise.resolve()
    .then(() => theme.findOne(filter, projections).exec() )
    .then( theme => {

      if(!theme){

        throw ERROR.NOT_FOUND;
      }

      return theme;
    });
  };

  theme.addQuestion = (themeId, questionData) => {

    return Promise.resolve()
    .then(() => Promise.all([
      theme.exist({_id: themeId}),
      theme.existQuestion(themeId, questionData.number, questionData.question)
    ]) )
    .then( exist => {

      if(!exist[0]){

        throw theme.ERROR.NOT_FOUND;
      }

      if(exist[1]){

        throw theme.ERROR.CONFLICT;
      }

      let qt = new question(questionData);

      return theme.updateOne({_id: themeId}, {$push: {questions: qt}}).exec();
    })
    .then( count => {

      if(count.n === 0){

        throw theme.ERROR.NOT_FOUND;
      }

      return;
    });
  };

  theme.rmQuestion = (themeId, questionData) =>{

    return Promise.resolve()
    .then(() => Promise.all([
      theme.exist({_id: themeId}),
      theme.existQuestion(themeId, questionData.number, questionData.title)
    ]) )
    .then( exist => {

      if(!exist[0] || !exist[1]){

        throw theme.ERROR.NOT_FOUND;
      }

      return theme.updateOne({_id: themeId}, {$pull: {questions: {number: questionData.number, question: questionData.question}}}).exec();
    })
    .then( count => {

      if(count.n === 0){

        throw theme.ERROR.NOT_FOUND;
      }

      return;
    });
  };

  theme.addSection = (themeId, sectionData) =>{

    return Promise.resolve()
    .then(() => Promise.all([
      theme.exist({_id: themeId}),
      theme.existSection(themeId, sectionData.number, sectionData.title)
    ]) )
    .then( exist => {

      if(!exist[0]){

        throw theme.ERROR.NOT_FOUND;
      }

      if(exist[1]){

        throw theme.ERROR.CONFLICT;
      }

      let st = new section(sectionData);

      return theme.updateOne({_id: themeId}, {$push: {sections: st}}).exec();
    })
    .then( count => {

      if(count.n === 0){

        throw theme.ERROR.NOT_FOUND;
      }

      return;
    });
  };

  theme.rmSection = (themeId, sectionData) =>{

    return Promise.resolve()
    .then(() => Promise.all([
      theme.exist({_id: themeId}),
      theme.existQuestion(themeId, sectionData.number, sectionData.title)
    ]) )
    .then( exist => {

      if(!exist[0] || !exist[1]){

        throw theme.ERROR.NOT_FOUND;
      }

      return theme.updateOne({_id: themeId}, {$pull: {sections: {number: sectionData.number, title: sectionData.title}}}).exec();
    })
    .then( count => {

      if(count.n === 0){

        throw theme.ERROR.NOT_FOUND;
      }

      return;
    });
  };

  theme.add = newData => {

    return Promise.resolve()
    .then(() => Promise.all([
      theme.exist({title: newData.title}),
      theme.exist({number: newData.number})
    ]) )
    .then( resp => {

      if(resp[0] || resp[1]){

        throw ERROR.CONFLICT;
      }

      return theme.create(newData);
    });
  };

  theme.edit = (themeId, editedData) => {

    return Promise.resolve()
    .then(() => theme.updateOne({_id: themeId},{$set: editedData}).exec())
    .then(resp => {

       if(resp.n === 0){

         throw theme.ERROR.NOT_FOUND;
       }
    })
    .catch(err => {
      if(err.code === 11000){

        throw theme.ERROR.CONFLICT;
      }

      throw theme.ERROR.UNKNOWN;
    });
  };

  theme.rm = filter => {

    return Promise.resolve()
    .then(() => theme.deleteOne(filter).exec() )
    .then( count => {

      if(count.n === 0){

        throw ERROR.NOT_FOUND;
      }

      return;
    });
  };

  theme.exist = filter => {

    return Promise.resolve()
    .then(() => theme.getOne(filter, {_id: 1}))
    .then(() => true)
    .catch(() => false);
  };

  theme.existSection = (themeId, number, title) => {

    return Promise.resolve()
    .then(() => theme.getOne({_id: themeId}, {sections: 1}) )
    .then( theme => !!_.find(theme.sections, section => (section.number === number || section.title.toLowerCase() === title.toLowerCase()) ) )
    .catch(() => false);
  };

  theme.existQuestion = (themeId, number, question) => {

    return Promise.resolve()
    .then(() => theme.getOne({_id: themeId}, {questions: 1}) )
    .then( theme => !!_.find(theme.questions, quest => (quest.number === number || quest.title.toLowerCase() === question.toLowerCase()) ) )
    .catch(() => false);
  };

  return theme;
};
