---
id: react-development
title: React Development
---

[comment]: # (mx-abstract)

## Introduction

Every developer has his/her own code style that has been developed along the way, with bits and quirks that, at some point, become a part of oneself. 

However, in a big team and in a big project, small quirks and personal preferences can add up and turn the codebase into a big lasagna. 

Given this, we have established some basic principles and a code style we would like to follow. These are, of course, not set in stone, and can be changed, given a valid reason.

## Using Git

:::important
* We use **yarn** as a package manager.
:::

### Branch naming
We use a system for **branch naming**: \[your initials\]/-[feature || fix || redesign\]/-\[2-3 words describing the branch\]  
> e.g. John Doe creates `jd/feature/fix-thing-called-twice`

:::note
All branch names are lowercase
:::


## Basic principles

### Imports and exports
We import **lodash-specific functions** instead of the whole library for the tree shaking to take effect.

```jsx
// DON'T import _ from 'lodash'; 
// this also doesn't shake that tree, unfortunately. 
// You can find more info on webpack website about tree shaking. 
import {cloneDeep, isEmpty} from 'lodash'; // DO import cloneDeep from 'lodash/cloneDeep'; 
import isEmpty from 'lodash/isEmpty'; 
import last from 'lodash/last'; 
import uniqBy from 'lodash/uniqBy'; 
import get from 'lodash/get';`
```

Do not use `default` exports. **Use named exports** instead.


### Using conditionals
Avoid using nested conditionals. **Use early returns** instead.

```jsx
// 🚫 DON'T
if (condition) { 
  if (anotherCondition) { 
    // do stuff 
  } 
}
// ✅ DO
if (!condition) { 
  return; 
}
if (!anotherCondition) { 
  return; 
}
// do stuff
```

### Defining function arguments
If a function has more than 2 arguments and the second argument is not optional, **use an object** instead.

```jsx
// 🚫 DON'T 
const myFunction = (arg1, arg2, arg3) => { 
  // do stuff 
}

// ⚠️ AVOID
const myFunction = (arg1: string, arg2?: boolean) => { // not recommended but acceptable
  // do stuff 
}

// ✅ DO 
const myFunction = ({arg1, arg2, arg3}) => { 
  // do stuff 
}
```

### Validity checks
We use **`!=` or `== null` verifications** for all variables, and `!myBool` for booleans only.

```jsx
// 🚫 DON'T 
const user = userSelector(state); 
if (!user) {
  //do something
  if (!refetchAttempted){ 
    refetch();
  } 
}

// ✅ DO 
const user = userSelector(state); 
if (user == null) {
  //do something
  if (!refetchAttempted) { 
    refetch();
  }
} 
```

When using a property from an object inside a condition, check for null with **optional chaining operator**;

```jsx
// 🚫 DON'T 
if (array != null && array.length){ 
  // do stuff 
} 
// ✅ DO 
if (array?.length > 0){ 
  //do stuff 
}
```

### Folder structure
For folder and file naming we're using the following convention:  
**camelCase for all folders and files, except when it's a React Component or a Module Root Folder**, in which case we're using PascalCase.  
Also, for components' and containers' subcomponents, we create separate folders, even if there is no style file present. 
Each folder that has an exportable component will have an **`index.tsx`** file for ease of import. <br/>
Each folder that has an exportable file will have an **`index.ts`** file for ease of import.

###File length convetions:
- < 100 lines of code - ✅ OK
- 100 - 200 lines of code - try to split the file into smaller files
- 200 - 300 lines of code - should be split the file into smaller files
- > 300 lines of code 🚫 DON'T

### Naming conventions
* When naming types, use the suffix **`Type`**. This helps us differentiate between types and components. When naming component props types, use MyComponentPropsType. When naming a type that is not a component, use MyFunctionType. When naming return values, use MyFunctionReturnType.


**Try to extract at the top of the function all constants** such as strings, numbers, objects, instead of declaring this ad hoc inside the code.

```jsx
// 🚫 DON'T 
if (x === 'rejected' && y === 4) { 
  // do stuff 
} 
// ✅ DO
enum PermissionEnum { // all enums should be in PascalCase and suffixed with "Enum" 
  rejected = "rejected" 
} 
const ACCESS_LEVEL = 4; // all constants declared on top of functions should be in UPPER_CASE
if (x === PermissionsEnum.rejected && y === ACCESS_LEVEL)
{ 
  //do stuff 
}
```



## React guidelines

### Using functional components
We're using **functional components** for almost all new components, no classes, except when strictly necessary (e.g. error boundaries);

### Using selectors
We use `useSelector` and `useDispatch` hooks to connect to redux store via react-redux. 🚫 **No** `mapStateToProps` in functional components.

We use **reselect** for memoizing complex state variables and composing those into optimized selectors that don't rerender the whole tree when the values don't change. This package needs to be added only when there is a performance bottleneck, either existing or expected.

### Defining handlers

We're using **"handle" prefix** for handlers defined in the function and **"on"** prefix for handlers passed via props. `handleTouchStart` vs `props.onTouchStart`, to distinguish between own handlers and parent handlers.

```jsx
function handleClick(e) { 
    props.onClickClick(); 
} 

<div onClick={handleClick}/> 

//destructured before, instantly known to be from parent 
<div onClick={onClick}/>`
```

### Inline functions
No **inline functions** in TSX.

```jsx
// 🚫 DON'T 
<TouchableOpacity onPress={() => setPressed(true)}/> 
// ✅ DO 
const handlePress = () => { 
  setPressed(true) 
} 
<TouchableOpacity onPress={handlePress}/>
```

### Implicit values
Use implicit `true` for **boolean** props

```jsx
// 🚫 DON'T 
<Card isFullscreen={true}/> 
// ✅ DO 
<Card isFullscreen /> 
```

### Over-optimization 
No **`useCallback` or `useMemo` or `React.memo` unless really necessary**. Since the release of hooks, over-optimization has become a big problem.

```jsx
// 🚫 DON'T 
const handlePress = useCallback(() => setPressed(true), []); 
<TouchableOpacity onPress={handlePress}/> 
// 🚫 DON'T 
const value = useMemo(() => user.level * multiplicator); 

// ✅ DO 
const handlePress = useCallback(() => setPressed(true), []); 
<Context.Provider value={{onPress: handlePress}}> 
  {children} 
</Context.Provider>
```

### Conditionally rendered JSX

In React, conditionally rendered JSX is very common. Given the ability to render it inline, it's very easy to include it inside normal JSX:

```jsx
<Container> 
  {hasAchievements ? <ProfileAchievementsCard/> : <EmptyAchievements/>} 
  <View> 
    <Text> {title} </Text> 
    {mysteryBoxEnabled && <ProfileMysteryBoxesCard isCurrentUser={isCurrentUser}/>} 
  </View> 
</Container>
```

## Rules for hooks

1. **Fake modularization**:
  * Custom hooks may give the impression of modularization, but their logic runs inline in the parent component.
  * State changes and reactive behavior in the hook will cause a rerender of the host component and any other hooks that depend on the updated hook.
2. **Hook return values**:
  * Custom hooks should return either a single function (for a lazy hook) or an object containing a function and some properties;
  * Avoid returning objects with multiple functions to ensure consistency and maintainability;
  * Use interfaces for hook return type:
    ```jsx
    useMyHook({firstParam, secondParam}: UseMyHookParamsType): UseMyHookReturnType => {}
    ```
3. **State management and data fetching**:
  * Lifting state up should be used sparingly; hooks should primarily be used to gather state in one container and distribute it to child components.
  * Strive to couple data fetching with UI rendering as isolating as possible to prevent unnecessary rerenders.
  * Ensure one hook does not trigger the rerender of another by carefully managing dependencies and side effects.
  * If only 10% of the lines of code in a hook do specific React logic like state management, or calling a selector from Redux, consider splitting the hook into:
    - a smaller hook that does the React logic and returns the state, and
    - a statless function that will be called inside the hook and will do the rest of the logic. This stateless function should be tested separately.
4. **Hook interfaces**:
  * Use interfaces for hook params if you're passing more than one argument to the hook invocation:
    ```jsx
    useMyHook({firstParam, secondParam}: UseMyHookParamsType) => {}
    ```
5. If a hook exports > 4 values, it should draw a red flag and be refactored. If it exports >= 7 values, it should be refactored immediately.

## Modularisation

Given the size of the project, we have agreed on a couple of modularisation techniques that will help us to:

* Split the logic into more readable chunks of logic;
* Test all bits of logic with unit tests;
* Reuse components/utils/hooks as needed;

There are a couple of rules that we agreed upon and will be enforced in all PRs, to try and maintain the code in a state that is easy to navigate, read, debug and change. We try to move as much mental load as we can to the develop who is writing the code, instead of the developer who is reading the code.

Therefore, we agreed on the certain principles: 

### Abstracting the logic away into hooks and functions

If there is a piece of code in a component or container that holds a certain amount of logic and can be converted to a testable hook or utils function, we should move it to a separate function/hook and add props interface, return type interface and a test file.

For example: 

```jsx
const lastExpiringNotificationMissionId = useSelector( expiringNotificationMissionIdSelector ); 
useEffect(() => { 
  if ( missionEndDate && missionId && missionId !== lastExpiringNotificationMissionId ) {
    const earlierWith = ONE_HOUR_MS * 2; 
    const calculatedDate = missionEndDate - earlierWith; 
    const instantiateLocalNotification = async () => { 
      NotificationManager.startLocalNotification( 
        t('modules.mysteryBox.notification.title'), 
        t('modules.mysteryBox.notification.description'), 
        calculatedDate?.toString(), 
        NotificationPayloadTypesEnum.MYSTERY_BOX_EXPIRING
      ); 
    };  
    dispatch(setExpiringNotificationMissionId(missionId)); 
    instantiateLocalNotification(); 
  } 
}, [lastExpiringNotificationMissionId]);
```

👆 This piece of logic is a perfect candidate to be moved to a separate hook file, because it containes
a very specific piece of logic, can be tested and the behaviour is easier to predict and debug.

```jsx
const sanitizedHerotag = name ? sanitizeHerotag(name) : undefined; 
const herotagName = sanitizedHerotag != null && sanitizedHerotag !== name ? sanitizedHerotag : undefined; 
const nameWithInitials = name || savedAddress; 
const initials = getInitials(nameWithInitials); 
return herotagName ? getHerotagPrefix(avatarIconTextMaxLength, herotagName) : initials;
```

👆 This is another piece of logic that is a single "organism", meaning it can be moved to a function that takes in a certain set of arguments and returns a specific value. 

We can abstract these kind of calculations into separate functions, where the logic doesn't pollute the container's file, is easily testable and can be debugged and changed more easily. 

Try to identify this kind of "organisms" in your code and move them to a separate file only if the logic is worth it. **Don't overdo it for simple pieces of logic, **unless they are either taking a lot of space or mental load to read through.

```jsx
const sanitizedHerotag = name ? sanitizeHerotag(name) : undefined; 
const herotagName = sanitizedHerotag != null && sanitizedHerotag !== name ? sanitizedHerotag : undefined;
```

👆 This piece of code would not be worth it, since the logic is very simple, straightforward and there is not much to test.   
  
However, 

```jsx
const avatar = useSelector(avatarSelector);
const sanitizedHerotag = name ? sanitizeHerotag(name) : undefined; 
const herotagName = sanitizedHerotag != null && sanitizedHerotag !== name ? sanitizedHerotag : undefined; 
const isHerotagValid = herotagName == null; 
const shouldAllowHerotagCreation = !isHerotagValid; 
const canUserCreateAvatar = !shouldAllowHerotagCreation && avatar == null;
```

👆 This logic, even though might seem simple, has a lot of steps that need to be take to reach the final solution, `canUserCreateAvatar`, and would be a good candidate for a separate function.

In this case, it would be a good idea to abstract away the mental load needed to read through all this just to understand the container's code. The logic is abstracted away and tested, and if the `canUserCreateAvatar` result is buggy, there is a start and an end for debugging.  
  
If a piece of logic is a bit complex, works like an entity that could have an input and an output and has more than 7-10 lines of code, consider moving it to a hook/function.

> input → **function** → output

###Abstracting complex calculations into constants

Certain inline calculations are not worth moving into a hook/function, but a constant will help remove some complexity and will attach a "name" to the calculation, making it easier to understand what's inside:

```jsx
if (!isMissionCountdownLoading && missionCountdownData && isMIssionCountdownDataReady && currentMysteryBox && missionCountdownData?.status === MysteryBoxStatus.FINISHED )
{
  //...
}
```

👆 This would be a very good example of an inline if that we try to avoid. It does have a lot of simple conditions that are being tested, but there is a certain mental load needed to parse every single && and the comparison seems to ask for a name.

We could rewrite it to something like this:

```jsx
const isMissionCountdownDataReady = !isMissionCountdownLoading && missionCountdownData; 
const isMissionAlreadyFinished = !currentMysteryBox && missionCountdownData?.status === MysteryBoxStatus.FINISHED; 
if (isMysteryBoxMissionStautsChanged && isMIssionCountdownDataReady )
{
  //...
}
```

If we assign complex or even simple but long operations to local variables, we give them a name that can be used to infer what's inside, instead of calculating it ourselves. Sort of like a memoization. By naming a piece of logic, we memoize it and avoid recomputing it inside our heads, unless necessary.

Again, as with hooks and functions, **don't overdo it. **There are certain calculations that, like in JavaScript, are easy for the brain to parse and understand, so it's not worth moving them to a local variable:

```jsx
if (myClaimableAuctions != null && myClaimableAuctions.length > 0) {
  //...
}
```

Here, it's not worth moving the if logic inside a local variable, it would be redundant, as it's very easy to read through it.

However, JSX sometimes tends to grow very big and it requires a certain amount of mental load to stop at these conditionals and understand what's rendered inside.

One could argue that there's an "organism" inside, a certain piece of logic that results in a component being rendered after some calculations and state changes. We try to give names to these operations that result in a JSX, so the developer knows what's in that JSX.

**Thus, all conditionally rendered JSX** **goes into a constant**. We don't render conditional JSX inline

```jsx
const achievementsContainer = hasAchievements? <ProfileAchievementsCard/> : <EmptyAchievements/>;
const mysteryBoxesContainer = mysteryBoxEnabled && <ProfileMysteryBoxesCard isCurrentUser={isCurrentUser} />;
 
 <Container> 
  {achievementsContainer} 
  <View> 
    <Text> {title} </Text> 
    {mysteryBoxesContainer} 
  </View> 
</Container>
```

### New functions/hooks

When creating new functions and hooks, the new entity must have:

* A props interface, if it accepts any arguments, declared in the function's file;
* A return interface, it the function or hook returns more than a simple primitive, declared in the function's file;
* A test function that tests the function and covers all test cases; As far as possible try to adhere to the ZOMBIES testing technique. The test should be created in the \_\_tests\_ folder;
* At most 50 lines of code, ideally 20 lines.

```jsx
interface UseKYCModalStatePropsType { 
  isStatusFailed: boolean; 
  handleOpenInitiateKYCModal: () => void; 
} 

interface UseKYCModalStateReturnType { 
  KYCInitialModalState: KYCInitialModalStateEnum; 
  setKYCInitialModalState: (newState: KYCInitialModalStateEnum) => void; 
} 

export const useKYCModalState = ({ isStatusFailed, handleOpenInitiateKYCModal }: UseKYCModalStatePropsType): UseKYCModalStateReturnType => {}
```

We believe that adhering to these concepts will help us maintain the codebase at a sane level and will allow us a lot of manoeuvrability in the long run, both in building new features and in solving bugs quickly and reliably in times of crisis.

