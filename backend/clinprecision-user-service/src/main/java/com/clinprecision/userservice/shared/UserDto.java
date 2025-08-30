package com.clinprecision.userservice.shared;

import java.io.Serializable;
import java.util.List;

import com.clinprecision.userservice.ui.model.AlbumResponseModel;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = -953297098295050686L;
	
	private String firstName;
	private String lastName;
	private String email;
	private String password;
	private String userId;
	private String encryptedPassword;
	private List<AlbumResponseModel> albums;

}
