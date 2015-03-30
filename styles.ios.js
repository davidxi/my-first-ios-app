var React = require('react-native');

var {
  StyleSheet,
} = React;

module.exports = StyleSheet.create({
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
  movieDetailsViewContainer: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
  movieDetailsViewBlock: {
    flex: 0,
    marginBottom: 10,
    padding: 5,
    borderTopWidth: 1
  },
  topNavBar: {
    flex: 0,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3A9425'
  }
});