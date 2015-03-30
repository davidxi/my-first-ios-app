var React = require('react-native');
var assign = React.__spread;
var styles = require('./styles.ios.js');

var {
  AppRegistry,
  Image,
  ListView,
  Navigator,
  Text,
  TouchableHighlight,
  View,
} = React;
var TextFactory = React.createFactory(Text);
var ViewFactory = React.createFactory(View);
var TouchableFactory = React.createFactory(TouchableHighlight);


var API_KEY = '7waqfqbprs7pajbz28mqf6vz';
var PAGE_SIZE = 25;
var PARAMS = '?apikey=' + API_KEY + '&page_limit=' + PAGE_SIZE;

var AppNavigator = React.createClass({
  renderScene: function(route, navigator) {
    var props = {
      onForward: function() {
        var nextIndex = route.index + 1;
        navigator.push({
          name: 'Scene ' + nextIndex,
          index: nextIndex,
        });
      },
      onBack: function() {
        if (route.index > 0) {
          navigator.pop();
        }
      },
      name: route.name,
      navigator: navigator
    };

    if (route.name === MovieDetailsScene.routeName) {
      props.movieId = route.movieId;
      return React.createElement(MovieDetailsScene, props);
    } else {
      // default
      return React.createElement(CurrentMoviesScene, props);
    }
  },
  render: function() {
    return React.createElement(Navigator, {
      initialRoute: {name: CurrentMoviesScene.routeName, index: 0},
      renderScene: this.renderScene
    });
  }
});

var BaseViewMixin = {
  renderLoadingView: function() {
    var props = {
      children: TextFactory({}, 'Loading movies...'),
      style: styles.container
    };
    return ViewFactory(props);
  },
  renderBlock: function(children) {
    return <View style={styles.movieDetailsViewBlock} children={children} />;
  },
  renderImageBlock: function(src) {
    return this.renderBlock(
      <Image source={{uri: src}} style={styles.largePic} />
    );
  },
  renderTextBlock: function(children) {
    return this.renderBlock(<Text children={children} />);
  },
  onPressBtnBackToHP: function() {
    this.props.navigator.push({
      name: CurrentMoviesScene.routeName
    });
  },
  renderNavBar: function() {
    return (
      <TouchableHighlight style={styles.topNavBar} onPress={this.onPressBtnBackToHP}>
        <Text style={{color: '#FFFFFF'}} children='Back To HomePage' />
      </TouchableHighlight>
    )
  }
};

var CurrentMoviesScene = React.createClass({
  mixins: [BaseViewMixin],
  statics: {
    routeName: 'Current Movies'
  },
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
    var API_URL = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json';
    var REQUEST_URL = API_URL + PARAMS;
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
    var self = this;
    var props ={
      dataSource: this.state.dataSource,
      renderRow: function(movie) {
        return MovieCardFactory(assign(movie, {navigator: self.props.navigator}));
      },
      style: styles.listView
    };
    return React.createElement(ListView, props);
  }
});

var MovieDetailsScene = React.createClass({
  mixins: [BaseViewMixin],
  propTypes: {
    movieId: React.PropTypes.number.isRequired
  },
  statics: {
    routeName: 'Movie Details'
  },
  getInitialState: function() {
    return {
      movieData: null,
      castData: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      loaded: false,
      similarMovies: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
    };
  },
  fetchData: function() {
    var DETAILS_URL = 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + this.props.movieId + '.json';
    var SIMILAR_URL = 'http://api.rottentomatoes.com/api/public/v1.0/movies/' +  this.props.movieId + '/similar.json';
    fetch(DETAILS_URL + PARAMS)
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          movieData: responseData,
          castData: this.state.castData.cloneWithRows(responseData.abridged_cast)
        });
        fetchSimilarMovies.call(this);
      })
      .done();
    function fetchSimilarMovies() {
      fetch(SIMILAR_URL + PARAMS)
        .then((response) => response.json())
        .then((responseData) => {
          this.setState({
            similarMovies: this.state.similarMovies.cloneWithRows(responseData.movies),
            loaded: true
          });
        })
        .done();
    }
  },
  componentDidMount: function() {
    this.fetchData();
  },
  render: function() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }
    var props = assign({}, this.props, this.state.movieData);
    return (
      <View style={styles.movieDetailsViewContainer}>
        {this.renderNavBar()}
        <MovieCard {...props} />
        {this.renderTextBlock(props.ratings.critics_score + '/100 (Critics)   ' + props.ratings.audience_score + '/100 (Audience)')}
        {this.renderTextBlock(Math.floor(props.runtime / 60) + ' hours ' + (props.runtime % 60) + ' minutes')}
        {this.renderTextBlock(props.studio)}
        {this.renderTextBlock((props.genres || []).join(' , '))}
        {this.renderTextBlock(props.synopsis)}
        {React.createElement(ListView, {
          style: styles.movieDetailsViewBlock,
          dataSource: this.state.castData,
          renderRow: function(cast) {
            return TextFactory({
              children: cast.name + ' -- ' + (cast.characters || []).join(' , ')
            });
          }
        })}
        {React.createElement(ListView, {
          style: styles.movieDetailsViewBlock,
          dataSource: this.state.similarMovies,
          renderRow: function(movie) {
            return MovieCardFactory(assign(movie, {navigator: this.props.navigator}));
          }
        })}
      </View>
    );
  }
});

var MovieCard = React.createClass({
  propTypes: {
    navigator: React.PropTypes.object.isRequired
  },
  onPressButton: function() {
    this.props.navigator.push({
      name: MovieDetailsScene.routeName,
      movieId: this.props.id
    });
  },
  renderImageBlock: function(props) {
    var imageElem = React.createElement(Image, {
        source: {uri: props.posters.thumbnail},
        style: styles.thumbnail,
    });
    return TouchableFactory({
      onPress: this.onPressButton,
      children: imageElem
    });
  },
  renderInfoBlock: function(props) {
    var infoElem = ViewFactory({
      children: [
        TextFactory({style: styles.title}, props.title),
        TextFactory({style: styles.year}, props.year),
      ]
    });
    return TouchableFactory({
      style: styles.rightContainer,
      onPress: this.onPressButton,
      children: infoElem
    });
  },
  render: function() {
    var props = assign({}, this.props);
    props.style = styles.container;
    props.children = [
      this.renderImageBlock(props),
      this.renderInfoBlock(props)
    ];
    return ViewFactory(props);
  }
});
var MovieCardFactory = React.createFactory(MovieCard);

/**
 * exports
 */
AppRegistry.registerComponent('AwesomeProject', () => AppNavigator);