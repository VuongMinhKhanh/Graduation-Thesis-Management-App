import { FlatList, Text, TouchableOpacity } from "react-native";
import Styles from "./Styles";

export default FAQList = ({ faqs, onFAQClick }) => {
  return (
    <FlatList
      data={faqs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FAQItem faq={item} onFAQClick={onFAQClick} />
      )}
      style={Styles.faqContainer}
    />
  );
};

const FAQItem = ({ faq, onFAQClick }) => {
  // console.log(faq)
  return (
    <TouchableOpacity onPress={() => onFAQClick(faq)}>
      {faq.question !== "default" && faq.question.endsWith("?") && (
        <Text style={Styles.faqQuestion}>{faq.question}</Text>
      )}
    </TouchableOpacity>
  );
};