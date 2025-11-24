import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import * as ImagePicker from "expo-image-picker";
import Input from "@/components/Input";
import * as Icons from "phosphor-react-native";
import BackButton from "@/components/BackButton";
import Typo from "@/components/Typo";
import { useAuth } from "@/contexts/authContext";
import Button from "@/components/Button";
import { verticalScale } from "@/utils/styling";

const NewConversationModal = () => {
  const { isGroup } = useLocalSearchParams();
  const isGroupMode = isGroup == "1";
  const router = useRouter();
  const [groupAvatar, setGroupAvatar] = useState<{ uri: string } | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const { user: currentUser } = useAuth();

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      //   allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    console.log(result);

    if (!result.canceled) {
      setGroupAvatar({ uri: result.assets[0].uri });
    }
  };

  const toggleParticipant = (user: any) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(user.id)) {
        return prev.filter((id: string) => id !== user.id);
      } else {
        return [...prev, user.id];
      }
    });
  };

  const onSelectUser = (user: any) => {
    if (!currentUser) {
      Alert.alert("Please login to start a conversation");
      return;
    }

    if (isGroupMode) {
      toggleParticipant(user);
    } else {
      // todo: start a new convo
    }
  };

  const createGroup = async () => {
    if(!groupName.trim() || !currentUser || selectedParticipants.length < 2) return;

    //todo: create a group
  };

  const contacts = [
    {
      id: 1,
      name: "John Doe",
      avatar: "https://i.pravatar.cc/300?u=1",
      isOnline: true,
    },
    {
      id: 2,
      name: "Jane Smith",
      avatar: "https://i.pravatar.cc/300?u=2",
      isOnline: false,
    },
    {
      id: 3,
      name: "Mike Johnson",
      avatar: "https://i.pravatar.cc/300?u=3",
      isOnline: false,
    },
    {
      id: 4,
      name: "Emily Davis",
      avatar: "https://i.pravatar.cc/300?u=4",
      isOnline: false,
    },
    {
      id: 5,
      name: "David Wilson",
      avatar: "https://i.pravatar.cc/300?u=5",
      isOnline: false,
    },
    {
      id: 6,
      name: "Sarah Brown",
      avatar: "https://i.pravatar.cc/300?u=6",
      isOnline: true,
    },
    {
      id: 7,
      name: "Robert Taylor",
      avatar: "https://i.pravatar.cc/300?u=7",
      isOnline: false,
    },
    {
      id: 8,
      name: "Lisa Anderson",
      avatar: "https://i.pravatar.cc/300?u=8",
      isOnline: true,
    },
    {
      id: 9,
      name: "Michael Thomas",
      avatar: "https://i.pravatar.cc/300?u=9",
      isOnline: false,
    },
    {
      id: 10,
      name: "Jennifer Martinez",
      avatar: "https://i.pravatar.cc/300?u=10",
      isOnline: true,
    },
  ];

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header
          title={isGroupMode ? "New Group" : "Select User"}
          leftIcon={<BackButton color={colors.black} />}
        />

        {isGroupMode && (
          <View style={styles.groupInfoContainer}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={onPickImage}>
                <Avatar
                  uri={groupAvatar?.uri || null}
                  size={100}
                  isGroup={true}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.groupNameContainer}>
              <Input
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contactList}
        >
          {contacts.map((user: any, index) => {
            const isSelected = selectedParticipants.includes(user.id);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.contactRow, isSelected && styles.selectedContact]}
                onPress={() => onSelectUser(user)}
              >
                <Avatar size={45} uri={user.avatar} />
                <Typo fontWeight={"500"}>{user.name}</Typo>

                {isGroupMode && (
                  <View style={styles.selectionIndicator}>
                    <View
                      style={[styles.checkbox, isSelected && styles.checked]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {
          isGroupMode && selectedParticipants.length >= 2 && (
            <View style={styles.createGroupButton}>
                <Button
                    onPress={createGroup}
                    disabled={!groupName.trim()}
                    loading={isLoading}
                >
                    <Typo 
                        fontWeight={'bold'}
                        size={17}>
                            Create Group
                        </Typo>
                </Button>
            </View>
          )
        }
      </View>
    </ScreenWrapper>
  );
};

export default NewConversationModal;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacingX._15,
    flex: 1,
  },
  groupInfoContainer: {
    alignItems: "center",
    marginTop: spacingY._10,
  },
  avatarContainer: {
    marginBottom: spacingY._10,
  },
  groupNameContainer: {
    width: "100%",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    paddingVertical: spacingY._5,
  },
  selectedContact: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
  },
  contactList: {
    gap: spacingY._12,
    marginTop: spacingY._10,
    paddingTop: spacingY._10,
    paddingBottom: verticalScale(150),
  },
  selectionIndicator: {
    marginLeft: "auto",
    marginRight: spacingX._10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checked: {
    backgroundColor: colors.primary,
  },
  createGroupButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacingX._15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
});
