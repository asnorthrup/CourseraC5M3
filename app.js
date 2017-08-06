//narrow it down app that allows users to search menu and then
//remove any menu items in the search they don't want
(function (){
'use strict'

angular.module('NarrowItDownApp',[])
.controller('NarrowItDownController', NarrowItDownController) //will wrap search textbox, botton and list of found menu items
.service('MenuSearchService', MenuSearchService) //search service to get menu items
.directive('foundItems', FoundItemsDirective); 

function FoundItemsDirective() {
  var ddo = {
    templateUrl: 'menuList.html',
    scope: {
      founditems: '<',
      clicked: '<',
      onRemove: '&' //reference binding
    },
    controller: NarrowItDownDirectiveController,
    controllerAs: 'myItems', //in menuList.html, we can refer to NarrowItDownDirectiveController as items
    bindToController: true
  };

  return ddo;
}

function NarrowItDownDirectiveController() {
  var conItems = this; //since you bound it earlier, items here gets the DDO bound to it. So you'd refer to the name of whatever is here to get to proprs in the DDO

  conItems.isEmpty = function () {
    if(conItems.clicked==true && conItems.founditems.length == 0){ //found items was bound to conItems, probably should be same name, but to demonstrate, made them different
      return true;
    }
    return false;
  };
}


NarrowItDownController.$inject = ['MenuSearchService'];
function NarrowItDownController(MenuSearchService){
  var menu = this;
  menu.found = [];
  menu.clicked = false;

  //store service response on the controller
  menu.getMatches = function(searchTerm){

    MenuSearchService.getMatchedMenuItems(searchTerm).then(function (response) { //resolve the promise
      menu.found = response; 
      menu.clicked = true;
    }) //not going to provide another function for error
    .catch(function (error) { //just use a catch all kind of function, just cleaner
      console.log("Something went terribly wrong.");
    });
  };

  menu.removeItem = function(itemIndex){
    menu.found.splice(itemIndex,1);
  };
}

MenuSearchService.$inject = ['$http']; //need to inject basepath - stops minification
function MenuSearchService($http) { //standard service, pass in basepath
  var service = this;

  //function to reach out to server and retrieve list of all menu items
  service.getMatchedMenuItems = function (searchTerm) {
    return $http.get("https://davids-restaurant.herokuapp.com/menu_items.json").then(function (result) {
        // process result and only keep items that match
        var allResults= result.data.menu_items;
        console.log(allResults);
        var foundItems= [];
        allResults.forEach(function(item){
          if(item.description.toLowerCase().includes(searchTerm) && !foundItems.includes(item.description)){
            foundItems.push(item.name + ", " +item.short_name + ", " +item.description);
          }
        })

      // return processed items
      return foundItems;
    });
  };

} //ends MenuSearchService


})();