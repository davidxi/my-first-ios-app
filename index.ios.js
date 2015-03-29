var React = require('react-native');

var {
  AppRegistry,
  Image,
  ListView,
  StyleSheet,
  Text,
  View,
} = React;
var TextFactory = React.createFactory(Text);
var ViewFactory = React.createFactory(View);


var API_KEY = '7waqfqbprs7pajbz28mqf6vz';
var API_URL = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json';
var PAGE_SIZE = 25;
var PARAMS = '?apikey=' + API_KEY + '&page_limit=' + PAGE_SIZE;
var REQUEST_URL = API_URL + PARAMS;


var AwesomeProject = React.createClass({
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loaded: false,
    };
  },

  componentDidMount: function() {
    this.fetchData();
  },

  fetchData: function() {
    fetch(REQUEST_URL)
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData.movies),
          loaded: true,
        });
      })
      .done();
  },

  render: function() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }
    var props ={
      dataSource: this.state.dataSource,
      renderRow: this.renderMovie,
      style: styles.listView
    };
    return React.createElement(ListView, props);
  },

  renderLoadingView: function() {
    var props = {
      children: TextFactory({}, 'Loading movies...'),
      style: styles.container
    };
    return ViewFactory(props);
  },

  renderMovie: function(movie) {
    var props = {};
    props.style = styles.container;
    props.children = [
      React.createElement(Image, {
        source: {uri: movie.posters.thumbnail},
        style: styles.thumbnail
      }),
      ViewFactory({
        style: styles.rightContainer,
        children: [
          TextFactory({style: styles.title}, movie.title),
          TextFactory({style: styles.year}, movie.year),
        ]
      })
    ];
    return ViewFactory(props);
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rightContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  year: {
    textAlign: 'center',
  },
  thumbnail: {
    width: 53,
    height: 81,
  },
  listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);