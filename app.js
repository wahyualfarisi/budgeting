var BudgetController = (function() {

    var Expenses = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value
        this.percentage = -1
    }

    Expenses.prototype.calculatePercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round( (this.value / totalIncome) * 100 );
        }else{
            this.percentage = -1
        }
    }

    Expenses.prototype.getPercentage = function() {
        return this.percentage
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(cur => {
            sum += cur.value 
        })
        data.totals[type] = sum
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
       addItem: function(type, desc , value){
           var newItem, ID;

           if(data.allItems[type].length > 0 ){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
           }else{
                ID = 0
           }
           
           if(type === 'exp'){
                newItem = new Expenses(ID, desc , value)
           }else if(type === 'inc'){
                newItem = new Income(ID, desc , value)
           }

           data.allItems[type].push(newItem)

           return newItem
       },

       deleteItem: function(type, id) {
            var ids , index 
            ids = data.allItems[type].map(function(current) {
                return current.id 
            })

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index , 1)
            }
       },

       calculateBudget: function(){
            //calculate tottal income and expenses 
            calculateTotal('exp')
            calculateTotal('inc')
            //calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp
            //calculate the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) 
            }else{
                data.percentage = -1
            }
       },

       calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calculatePercentage(data.totals.inc)
            })
       },

       getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage()
            })
            return allPerc
       },

       getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
       },

       getData: function(){
           return data
       }
    }
})()

var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        btn_add: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage'
    }

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                desc: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
            }
        },

        addItemToList: (obj, type) => {
            var html, elementDOM, newHtml;

            if(type === 'exp'){
                elementDOM = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'inc'){
                elementDOM = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', obj.value)
            document.querySelector(elementDOM).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem: (selectorID) => {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el)
        },

        clearFields: () => {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', '+ DOMstrings.inputValue);
            
            var fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach((current, index , array) => {
                current.value = ""
            });
        },

        displayBudget: (obj) => {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'
            }
        },

        diplayPercentages: (percentages) => {
            var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

            
            var nodelistForEach = function(list , cb) {
                for(var i = 0; i<list.length; i++){
                    cb( list[i], i )
                }
            }

            nodelistForEach(fields, function(current, index) {

                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'
                }else{
                    current.textContent = '---'
                }
                
            })

        },
 
        getDOM: () => DOMstrings
    }
})()


var Controller = (function(BudgetCTRL, UICtrl) {
    

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOM();
        document.querySelector(DOM.btn_add).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem()
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

    }

    var updateBudget = function(){
        //calculate budget
        BudgetCTRL.calculateBudget()

        //return the budget
        var budget = BudgetCTRL.getBudget();

        //display the budget on the UI
        UICtrl.displayBudget(budget)
    }

    var updatePercentages = function() {
        //calculate percentages
        BudgetCTRL.calculatePercentages();

        //read percentages from the budget controller
        var percentages = BudgetCTRL.getPercentages();

        //diplay on ui
        UICtrl.diplayPercentages(percentages)
    }

    var ctrlAddItem = function(){

        //1 . Get input data
        var input = UICtrl.getInput();

        if(input.desc !== "" && !isNaN(input.value) && input.value > 0 ) {
             //2. Add item to budget controller 
            var newItem = BudgetCTRL.addItem(input.type, input.desc, input.value);

            //3. display to UI
            UICtrl.addItemToList(newItem, input.type)
            
            //4. Clear input
            UICtrl.clearFields()

            //5. calculate and update budget
            updateBudget();

            //6. calculate and update percentages
            updatePercentages()
        }
    }

    var ctrlDeleteItem = function(event) {
        var item , splitItem, type, id
        item = event.target.parentNode.parentNode.parentNode.parentNode.id
        if(item) {
            splitItem = item.split('-');
            type = splitItem[0];
            id = parseInt(splitItem[1]) 

            //delete data
            BudgetCTRL.deleteItem(type,id)

            //delete from ui
            UICtrl.deleteListItem(item)

            //update budget
            updateBudget()

            //calculate and update percentages
            updatePercentages()
        }
    }

    

    return {
        init: function(){
            console.log('app controller is running')
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners()
        }
    }
})(BudgetController, UIController )

Controller.init()